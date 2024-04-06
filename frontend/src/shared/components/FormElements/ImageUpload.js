import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import "./ImageUpload.css";

const ImageUpload = (props) => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setIsValid] = useState(false);
  const filePickerRef = useRef();

  useEffect(()=>{  //to preview the url
    if(!file) {
        return;
    }
    const fileReader = new FileReader();
    fileReader.onload = ()=>{
        setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  },[file])

  const pickImageHandler = () => {  // => To click input type file without clicking it
    filePickerRef.current.click();
  };

  const pickedHandler = (e) => {  // => Main logic to acces the image
    let pickedFile
    let fileIsValid = isValid
    if (e.target.files && e.target.files.length === 1) {
       pickedFile = e.target.files[0]
        setFile(pickedFile);
        setIsValid(true)
        fileIsValid=true
    }else{
        setIsValid(false);
        fileIsValid=false
    }
    props.onInput(props.id, pickedFile, fileIsValid)  //=> if it bring isValid it would be not updated here 
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        style={{ display: "none" }}
        type="file"
        accept=".jpg, .png, .jpeg"
        ref={filePickerRef}
        onChange={pickedHandler}
      />

      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload_preview">
            {/* While inserting state always use condition for state to update first */}
          {previewUrl && <img src={previewUrl} alt="Preview" />}  
          {!previewUrl && <p>Please pick an Image.</p>}  
        </div>
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
