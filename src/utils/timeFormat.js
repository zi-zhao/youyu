export function convertDateFormat(dateTimeString) {
  const [dateString, timeString] = dateTimeString.split(" ");
  const [hour, minute] = timeString.split(":").slice(0, 2);
  return `${dateString} ${hour}:${minute}`;
}

export function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}