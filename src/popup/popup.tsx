import React, { useEffect } from "react";
import './popup.css'

const Popup = () => {
    useEffect(()=>{
        console.log("extension loaded")
    },[])
    return (
        <div>
            <h1 className="text-4xl text-green-500">Hello World</h1>
        </div>
    )
};

export default Popup;