export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const handleNotification = (isWork: boolean) => {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(isWork ? "Break time!" : "Time to focus!")
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(isWork ? "Break time!" : "Time to focus!")
        }
      })
    }
  }
}