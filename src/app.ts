import express  from "express";

const app = express();

//routes 
// http methods : PUT , POST , GET , DELETE , PATCH

app.get( '/' , (req , res , next)=>{
    res.json({message: "welcome to the rest api course"})
})

export default app;