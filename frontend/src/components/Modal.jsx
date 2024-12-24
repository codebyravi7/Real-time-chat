import React, { useState, useRef, useEffect, useMemo } from "react";
import { binarySearch } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";

const CreateGroupModal = ({ onClose, onSubmit }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef();
  const { users } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (!groupName.trim()) {
      alert("Group name is required!");
      return;
    }
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    onSubmit({ groupName, members: selectedUsers });
    onClose();
  };

  // Memoize filtered users
  //   const filteredUsers = useMemo(() => {
  //     if (searchQuery?.trim() === "") {
  //       return users;
  //     }
  //     return users?.filter(
  //       (user) =>
  //         user?.name?.toLowerCase().startsWith(searchQuery?.toLowerCase()) ||
  //         user?.username?.toLowerCase().startsWith(searchQuery?.toLowerCase())
  //     );
  //   }, [searchQuery, users]);

  //using the binary search
  //Filtered users using binary search
  const filteredUsers = useMemo(() => {
    if (searchQuery.trim() === "") {
      return users;
    }

    const startingIndex = binarySearch(users, searchQuery.trim());

    if (startingIndex === -1) {
      return []; // No match found
    }

    // Collect users that match the search query (startsWith)
    const result = [];
    for (let i = startingIndex; i < users.length; i++) {
      if (users[i].fullName.toLowerCase().startsWith(searchQuery.toLowerCase())) {
        result.push(users[i]);
      } else {
        break;
      }
    }
    return result;
  }, [searchQuery, users]);

  return (
    <div
      className="mt-80 fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg p-6 bg-white rounded-xl shadow-xl mx-4 sm:mx-0"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md rounded-xl"></div>
        <h2 className="text-2xl font-bold text-center">
          Create Group
        </h2>

        <input
          type="text"
          placeholder="Enter Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="bg-gray-100 w-full mt-6 p-4 text-lg border border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 outline-none transition-all"
        />

        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-100 w-full mt-4 p-3 text-lg border border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 outline-none transition-all"
        />

        <div className="scroll mt-4 pb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <>
                <div
                  key={user?._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                  <span className="text-base font-medium text-gray-700">
                    {user?.fullName}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedUsers?.includes(user?._id)}
                    onChange={() => toggleUserSelection(user?._id)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </div>
                <div className="border-[1px] w-[90%] mx-[5%]"> </div>
              </>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">No users found</p>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:scale-105 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
