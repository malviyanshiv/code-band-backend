import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import isEmail from "validator/lib/isEmail";

const minLengthMessage = (field) =>
    `${field} should be atleast 4 character long`;
const maxLengthMessage = (field) =>
    `${field} should be atmost 20 character long`;

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            minlength: [4, minLengthMessage("Username")],
            maxlength: [20, maxLengthMessage("Username")],
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (value) {
                    return isEmail(value);
                },
                message: "{VALUE} is not a valid email",
            },
        },
        password: {
            type: String,
            select: false,
            minlength: [4, minLengthMessage("Password")],
            maxlength: [20, maxLengthMessage("Password")],
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
            select: false,
        },
        name: {
            type: String,
            trim: true,
            minlength: [4, minLengthMessage("Name")],
            maxlength: [20, maxLengthMessage("Name")],
        },
        avatar: {
            type: Buffer,
            select: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

userSchema.virtual("avatar_url").get(function () {
    return `/api/users/${this.username}/avatar`;
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcryptjs.hash(this.password, 8);
    }
    next();
});

userSchema.method("toClient", function () {
    const obj = this.toObject();
    obj.password = obj.__v = obj.id = obj.isVerified = undefined;
    return obj;
});

userSchema.method("generateAuthToken", function () {
    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            data: {
                _id: this._id,
                username: this.username,
            },
        },
        process.env.JWT_SECRET
    );

    return token;
});

userSchema.static("findByCredentials", async function (username, password) {
    const user = await Users.findOne({
        username: username,
        isVerified: true,
    }).select("+password");

    if (!user) {
        throw new Error("Unable to login");
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }
    return user;
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

const Users = mongoose.model("Users", userSchema);

export default Users;
