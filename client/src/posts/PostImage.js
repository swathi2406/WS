import React from "react";
import { Button, Modal } from "react-bootstrap";
import DragDropImages from "./DragDropImages";
export default function PostImage() {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Image</Button>
      <Modal show={open} onHide={handleClose}>
        <Modal.Body>
          <h4 className="text-center mb-3">Lets post pics!</h4>
          <DragDropImages />
        </Modal.Body>
      </Modal>

      {/* <DropzoneDialogBase
        dialogTitle={dialogTitle()}
        acceptedFiles={["image/*"]}
        fileObjects={fileObjects}
        cancelButtonText={"cancel"}
        submitButtonText={"submit"}
        maxFileSize={10485760}
        open={open}
        onAdd={(newFileObjs) => {
          console.log("onAdd", newFileObjs);
          setFileObjects([].concat(fileObjects, newFileObjs));
        }}
        onDelete={(deleteFileObj) => {
          let arr = [];
          fileObjects.map((file) => {
            // console.log(file.file.name, deleteFileObj.file.name);
            if (file.file.name !== deleteFileObj.file.name) {
              arr.push(file);
            }
            setFileObjects(arr);
          });
          console.log("onDelete", deleteFileObj);
        }}
        onClose={() => setOpen(false)}
        onSave={() => {
          console.log("onSave", fileObjects);
          fileObjects.map((file) => {
            const data = new FormData();
            // data.append("name", file.file.name);
            data.append("image", file);
            console.log("file data (base64):", file.data);
            uploadPicture2(data);
            // .then((data) =>
            //   console.log("data:", data)
            // );
          });
          setOpen(false);
        }}
        showPreviews={true}
        showFileNamesInPreview={true}
      /> */}
    </div>
  );
}
