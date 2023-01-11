import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import pokemon from "pokemontcgsdk";

dotenv.config();

const sets = process.env.AVAILABLE_SETS.split(",");
let db, card, energy, user;

pokemon.configure({ apiKey: process.env.POKEMON_API_KEY });
const client = new MongoClient(process.env.MONGODB_URL);

const connect = async () => {
  await client.connect();
  db = client.db(process.env.MONGODB_DATABASE);
  card = db.collection(process.env.MONGODB_COLLECTION_CARD);
  energy = db.collection(process.env.MONGODB_COLLECTION_ENERGY);
  user = db.collection(process.env.MONGODB_COLLECTION_USER);
};

const disconnect = () => {
  client.close();
};

const init = async () => {
  await connect();

  // Init energy
  const types = (await pokemon.type.all()).map((x) => ({ type: x }));
  console.log("Energy collection clear");
  await energy.deleteMany();
  console.log("Energy collection init");
  await energy.insertMany(types);

  // Init card
  console.log("Card collection clear");
  await card.deleteMany();
  console.log("Card collection init");
  for (const set of sets) {
    console.log("Get set:", set);
    const cards = await pokemon.card.all({ q: `set.id:${set}`, orderBy: "number" });
    await card.insertMany(cards);
  }

  disconnect();
};

const explore = async () => {
  await connect();
  disconnect();
};

export default { connect, disconnect, init, explore };
