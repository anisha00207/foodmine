import {connect, ConnectOptions} from 'mongoose';

export const dbConnect = () => {
    connect("mongodb+srv://anisha002july:anisha150702@cluster0.ywjbj4d.mongodb.net/Food-Delivery-App", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions).then(
        () => console.log("connect successfully"),
        (error) => console.log(error)
    )
}