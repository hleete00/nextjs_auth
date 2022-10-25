import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  const client = await MongoClient.connect(
    "mongodb+srv://admin:admin@cluster0.lw6gvuk.mongodb.net/?retryWrites=true&w=majority"
  );

  return client;
}
