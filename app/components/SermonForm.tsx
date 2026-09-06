"use client";
import { useState } from "react";
export default function SermonForm(){
    const [url, setUrl] = useState("");

    const handleSubmit = () => {
        console.log(url);
    }
    return(
        <div>
            <input type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)} placeholder="Paste YouTube URL"/>

            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}