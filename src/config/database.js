import mongoose from 'mongoose';

const connectarDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
    });
    console.log('db conectada');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}


export default connectarDatabase;