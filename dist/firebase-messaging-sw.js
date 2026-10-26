importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "SIMULATED_KEY",
  authDomain: "demo-olmart-test.firebaseapp.com",
  projectId: "demo-olmart-test",
  storageBucket: "demo-olmart-test.firebasestorage.app",
  messagingSenderId: "76420360525",
  appId: "1:76420360525:web:d6781ea77ef0c2257aef04"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
