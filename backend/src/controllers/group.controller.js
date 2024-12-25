import Group from "../models/group.model.js";
import Message from "../models/message.model.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { groupName, members } = req.body.groupData;
    const admin = req.user._id;
    if (!groupName || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    // Include the current user as a member of the group
    const allMembers = [...members, admin];

    const newGroup = new Group({
      name: groupName,
      members: allMembers,
      admin, // Set the current user as the admin
    });

    console.log("hello2");

    await newGroup.save();

    console.log("hello3");
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating group:", error.message);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Get messages for a specific group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate({
      path: "messages",
      populate: { path: "senderId", select: "name" }, // Populate sender details
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json(group.messages);
  } catch (error) {
    console.error("Error fetching group messages:", error.message);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};

// Send a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create a new message
    const newMessage = new Message({
      senderId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Add the message to the group
    const group = await Group.findById(groupId);
    group.messages.push(newMessage._id);
    await group.save();

    // Emit the message to all group members
    group.members.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", {
          groupId,
          message: newMessage,
        });
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending group message:", error.message);
    res.status(500).json({ error: "Failed to send message" });
  }
};
