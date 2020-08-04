import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`server has started running ${process.env.PORT}`);
});
