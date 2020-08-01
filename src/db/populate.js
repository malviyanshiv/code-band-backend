import "./mongoose";
import PublicLists from "../models/PublicLists";
import HashTags from "../models/HashTags";
import Likes from "../models/Likes";
import Messages from "../models/Messages";
import Notifications from "../models/Notifications";
import PrivateLists from "../models/PrivateLists";
import Users from "../models/Users";
import Bookmarks from "../models/Bookmarks";

const populate = async () => {
    try {
        const user = new Users({
            username: "malviyanshiv",
            email: "malviyanshiv@gmail.com",
            password: "welcome@shiv",
            isVerified: true,
        });

        await user.save();

        const userShankar = new Users({
            username: "shankar",
            email: "shiv2855@gmail.com",
            password: "welcome@shankar",
            isVerified: true,
        });

        await userShankar.save();

        const unverifiedUser = new Users({
            username: "mamme_hunter",
            email: "mammehunter@gmail.com",
            password: "welcome@github.com",
            isVerified: false,
        });

        await unverifiedUser.save();

        const recursionTag = new HashTags({
            tag: "recursion",
        });
        const mlTag = new HashTags({
            tag: "ml",
        });

        await recursionTag.save();
        await mlTag.save();

        const recursionList = new PublicLists({
            name: "CP Recursion",
            description: "question set based on recursion",
            author: user._id,
            items: [
                {
                    _id: "5f0c3ca9aaa4c058d40376d9",
                    name: "codechef",
                    url: "codechef.com/rec1",
                },
            ],
            tags: [recursionTag._id],
            read: 100,
            likes: 50,
        });

        await recursionList.save();

        const mlList = new PublicLists({
            name: "ML resource list",
            description: "List of resouorces referencing ML content",
            author: user._id,
            tags: [recursionTag._id, mlTag._id],
            read: 123,
            likes: 19,
        });

        await mlList.save();

        await new PrivateLists({
            name: "My toDO list",
            author: user._id,
            items: ["shiv", "shankar"],
        }).save();

        await new Likes({
            listID: recursionList._id,
            userID: userShankar._id,
        }).save();

        await new Notifications({
            onwer: user._id,
            type: 0,
            description: "malviyanshiv has updated CP recursion list",
        }).save();

        await new Messages({
            message: "hello fraaand",
            sender: user._id,
            receiver: userShankar._id,
        }).save();

        // adding bookmarks
        await new Bookmarks({
            userID: userShankar._id,
            listID: recursionList._id,
        }).save();
        await new Bookmarks({
            userID: userShankar._id,
            listID: mlList._id,
        }).save();

        console.log("populated data successfully");
    } catch (e) {
        console.log("Some error occurred while populating data");
        console.log(e);
    }
};

populate();
