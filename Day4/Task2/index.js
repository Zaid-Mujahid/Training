document.addEventListener("DOMContentLoaded", function () {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      const mainContainer = document.querySelector(".main-course-container");
      data.cards.forEach((card) => {
        const cardContainer = document.createElement("div");
        cardContainer.className = "first-card";

        const cardContent = document.createElement("div");
        cardContent.className = "first-card-content";
        cardContainer.appendChild(cardContent);

        const imgElement = document.createElement("img");
        imgElement.src = card.img;
        cardContent.appendChild(imgElement);

        const contentContainer = document.createElement("div");
        contentContainer.classList.add("content-container");
        cardContent.appendChild(contentContainer);

        const topicElement = document.createElement("div");
        topicElement.classList.add("topic");
        const topic = document.createElement("p");
        topic.textContent = card.topic;
        const favElement = document.createElement("img");
        favElement.src = card.favourite;
        favElement.classList.add("topic");
        topicElement.appendChild(topic);
        topicElement.appendChild(favElement);
        contentContainer.appendChild(topicElement);

        const subjectElement = document.createElement("div");
        subjectElement.classList.add("subject");
        const subject = document.createElement("p");
        subject.textContent = card.subject;
        subjectElement.appendChild(subject);
        contentContainer.appendChild(subjectElement);

        const chapterElement = document.createElement("div");
        chapterElement.className = "chapter";
        const chapter = document.createElement("p");
        chapter.textContent = card.chapter;
        chapterElement.appendChild(chapter);
        contentContainer.appendChild(chapterElement);

        const tutorElement = document.createElement("div");
        tutorElement.className = "tutor";
        const select = document.createElement("select");
        tutorElement.appendChild(select);
        const option = document.createElement("option");
        option.textContent = card.tutor;
        select.appendChild(option);
        contentContainer.appendChild(tutorElement);

        const durationElement = document.createElement("div");
        durationElement.classList.add("duration");
        const duration = document.createElement("p");
        duration.textContent = card.duration;
        durationElement.appendChild(duration);
        contentContainer.appendChild(durationElement);

        const seperationElement = document.createElement("div");
        seperationElement.className = "seperation";
        cardContainer.appendChild(seperationElement);

        const performanceElement = document.createElement("div");
        performanceElement.className = "performance";
        performanceElement.innerHTML = `<img src="assets/icons/preview.svg" alt="" />
              <img src="assets/icons/manage course.svg" alt="" />
              <img src="assets/icons/grade submissions.svg" alt="" />
              <img src="assets/icons/reports.svg" alt="" />`;
        cardContainer.appendChild(performanceElement);

        mainContainer.appendChild(cardContainer);
      });

      data.alerts.forEach((alert) => {
        console.log(data.alerts);
        const mainAlertMenu = document.querySelector(".alert-menu");
        const alertContainer = document.createElement("div");
        alertContainer.className = "alert-container";
        mainAlertMenu.appendChild(alertContainer);

        const alertContent = document.createElement("div");
        alertContainer.appendChild(alertContent);

        const pa = document.createElement("div");
        pa.className = "pa";
        const paName = document.createElement("p");
        paName.className = "pa-name";
        paName.textContent = alert.name;
        const paImg = document.createElement("img");
        paImg.src = alert.img;
        pa.appendChild(paName);
        // pa.appendChild(paImg);
        alertContent.appendChild(pa);

        const paAlert = document.createElement("div");
        paAlert.className = "pa-alert";
        const paAlertMsg = document.createElement("p");
        paAlertMsg.textContent = alert.alertMsg;
        paAlert.appendChild(paAlertMsg);
        alertContent.appendChild(paAlert);

        const paCourse = document.createElement("div");
        paCourse.className = "pa-course";
        const paCousrseMsg = document.createElement("p");
        paCousrseMsg.textContent = alert.course;
        paCourse.appendChild(paCousrseMsg);
        alertContent.appendChild(paCourse);

        const paTime = document.createElement("div");
        paTime.className = "pa-time";
        const paFilesMsg = document.createElement("p");
        paFilesMsg.textContent = alert.files;
        const paTimeMsg = document.createElement("p");
        paTimeMsg.textContent = alert.time;

        paTime.appendChild(paFilesMsg);
        paTime.appendChild(paTimeMsg);
        alertContent.appendChild(paTime);
      });
      const mainNotificationContainer =
        document.querySelector(".notifications");
        data.notifications.forEach((notification) => {
        console.log(notification);

        const notificationContainer = document.createElement("div");
        notificationContainer.className = "noti-container";
        const contentContainer = document.createElement("div");
        contentContainer.className = "noti-content";

        notificationContainer.appendChild(contentContainer);

        const pa = document.createElement("div");
        pa.className = "noti";
        const paName = document.createElement("p");
        paName.className = "noti-name";
        paName.textContent = notification.name;
        const paImg = document.createElement("img");
        paImg.src = notification.img;
        pa.appendChild(paName);
        // pa.appendChild(paImg);
        contentContainer.appendChild(pa);

        const paCourse = document.createElement("div");
        paCourse.className = "pa-course";
        const paCousrseMsg = document.createElement("p");
        paCousrseMsg.textContent = notification.course;
        paCourse.appendChild(paCousrseMsg);
        contentContainer.appendChild(paCourse);

        const paTime = document.createElement("div");
        paTime.className = "pa-time";
        const paTimeMsg = document.createElement("p");
        paTimeMsg.textContent = notification.time;

        paTime.appendChild(paTimeMsg);
        contentContainer.appendChild(paTime);
        mainNotificationContainer.appendChild(contentContainer);
      });
    });
});
