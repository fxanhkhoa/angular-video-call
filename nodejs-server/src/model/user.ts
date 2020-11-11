import * as mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
    email: string,
    password: string,
    role: string,
}

const Schema = mongoose.Schema
const userSchema = new Schema({
    email: String,
    password: {
        type: String,
        required: true
    },
    role: String,
})
const User = mongoose.model<IUser>('user', userSchema)

export default User