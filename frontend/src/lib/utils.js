export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}


export const binarySearch = (array, query) => {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const current = array[mid].fullName.toLowerCase();

    if (current.startsWith(query.toLowerCase())) {
      return mid;
    }
    if (current < query.toLowerCase()) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
};
