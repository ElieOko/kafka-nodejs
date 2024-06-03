const express = require("express");
const kafka = require("kafka-node");
const app = express();
const sequelize = require("sequelize");

app.use(express.json())
const dbsAreRunning = async ()=>{
    const db = new sequelize(process.env.POSTGRES_URL)
    const User = db.define('user',{
        name_user: sequelize.STRING,
        email: sequelize.STRING,
        password: sequelize.STRING
    })
    db.sync({force:true})
    const client = new kafka.KafkaClient({kafkaHost:process.env.KAFKA_BOOTSTRAP_SERVERS})
    const producer = new kafka.Producer(client);
    producer.on('ready', async ()=>{
        app.post('/',async (req,res)=>{
            console.warn("@@@@@@@@@@@@@@@@@",req);
            
            await producer.send([{topic:process.env.KAFKA_TOPIC ,messages: JSON.stringify(req.body)}], async (err, data)=>{
                console.warn("@@@@@@@@@@@@@@@@@",req.body);
                if (err) console.error("Erreur au niveau ", err)
                else {
                  const dataBuild =  await User.create(req.body)
                    res.send({response:dataBuild})
                }  
            })
        })
    })
}

setTimeout(dbsAreRunning,10000);
// app.post("/",(req,res)=>{

// })
app.listen(8080)