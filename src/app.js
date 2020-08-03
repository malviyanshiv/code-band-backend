import express from "express";
import "./db/mongoose";
import userRouter from "./routers/users";
import publicListsRouter from "./routers/publicLists";
import privateListsRouter from "./routers/privateLists";
import bookmarkRouter from "./routers/bookmarks";
import notificationRouter from "./routers/notifications";
import hashtagRouter from "./routers/hashtags";
import authRouter from "./routers/auth";

/* registering
 */
import "./models/Bookmarks";
import "./models/HashTags";
import "./models/Likes";
import "./models/Notifications";
import "./models/PrivateLists";
import "./models/PublicLists";
import "./models/Users";

const app = express();

app.use(express.json());

app.use(authRouter);
app.use(userRouter);
app.use(publicListsRouter);
app.use(privateListsRouter);
app.use(bookmarkRouter);
app.use(notificationRouter);
app.use(hashtagRouter);

export default app;
