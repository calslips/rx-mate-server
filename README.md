# RxMate
A web application to help you remember when to take your medications! Users can create accounts, log in, add and remove medications, mark medications as taken for the day, and check their medication intake history.

**Link to project:** **[RxMate](https://rxmate.cyclic.app/)**

<p align="center">
  <a target="_blank" href="https://rxmate.cyclic.app/">
    <img src="https://i.ibb.co/PYhr36Q/rx-Mate-Thumbnail.jpg" width="50%" alt="Rx Mate web application login page."/>
  </a>
</p>

<!-- ![RxMate web application login page.](https://i.ibb.co/PYhr36Q/rx-Mate-Thumbnail.jpg) -->

## How It's Made:

**Tech used:** JavaScript, TypeScript, CSS, Tailwind, MongoDB, Express.js, React, Node.js, axios, FullCalendar.io

Account creation and credentialing was implemented with the use of [JWT](https://jwt.io/) (JavaScript Web Tokens) in conjunction with [bcrypt](https://www.npmjs.com/package/bcrypt) for hashing and encryption. [Mongoose](https://mongoosejs.com/) on top of [MongoDB](https://www.mongodb.com/) was used to maintain persistent storage of data for users, their medications and history. [React](https://reactjs.org/) was utilized to create a simplified interface including a dashboard for users to mark or unmark medications taken for the day, as well as a profile to add or remove medications. [FullCalendar](https://fullcalendar.io/) was implemented on the history page to enable users to view their historical medication intake. The use of the [Service Worker Web API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) along with the [web-push](https://www.npmjs.com/package/web-push) dependency enabled the addition of the notification/reminder feature. [Heroku](https://www.heroku.com/)'s scheduler capability also contributed to the notifications feature by facilitating scheduled pings to the server to identify medications due soon and distributing notifications when applicable.

## Optimizations

Refactor the structure of the data stored in the database. Currently, the User model contains all data relevent to their meds and history, so requesting user data retrieves all data whether it is needed or not. This schema could be separated out and handled more like relational data so that only pertienent data is retreived when necessary, but the related data is still connected and usable if needed. The calendar currently is read-only and displays the respective date's medication list. This could be refactored to include more interaction with the user, such as directly modifying medication lists (additions/removal) through the calendar. User feedback notifications need to be implemented (unsuccessful login, account already exists, etc.). Utilizing Heroku's free-tier and scheduler come with the constraints of limited resources. The project currently has the scheduler ping the server every hour and send reminder notifications for medications due within that timeframe. Ideally, this ping would occur more frequently and trigger notifications for medications due within 30 minute, 10 minute, and "now" intervals. Folder/file restructuring can also be improved to adopt a more MVC approach, as well as placing several helper functions in a helper directory and export them where needed.

## Lessons Learned:

Many dead ends were met in attempting to apply a notification system while the web application is closed. One of the potential solutions found was implementing the [Notification Triggers API](https://web.dev/notification-triggers/) in conjunction with the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API) and the [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). Unfortunately, Google decided to no longer pursue the Notification Triggers API capabilities project. Thankfully, this led me to identify that I could utilize the Service Worker API to create effective offline experiences and allow access to push notifications. Since Service Workers are event driven, I needed to find a way to trigger an event to initiate a notification push. Initially, I looked into [node-cron](https://www.npmjs.com/package/node-cron) to implement scheduled tasks via node, but while investigating how to implement node-cron I stumbled upon Heroku's built-in scheduler capability. This enabled me to utilize a service I had already implemented in the application without having to install an extra dependency. While not being a completely ideal solution (as outlined in the optimizations section), it does serve the intended purpose.
