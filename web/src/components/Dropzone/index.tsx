import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'
import './style.css';

interface Props {
  onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {

  const [selectedImage, setSelectedImage] = useState<string>('');

  const onDrop = useCallback(acceptedFiles => {
    const fileUrl = URL.createObjectURL(acceptedFiles[0]);

    setSelectedImage(fileUrl);

    onFileUploaded(acceptedFiles[0]);
  }, [onFileUploaded])
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: 'image/*'})

  return (
    <div className = 'dropzone' {...getRootProps()}>
      <input accept = 'image/*' {...getInputProps()} />
      {
        selectedImage ?
          <img src={selectedImage} alt="Imagem do ponto"/>
          :(
            isDragActive ?
              <p>
                  <FiUpload />
                  Solte aqui a imagem ...
              </p> :
              <p>
                  <FiUpload />
                  Arraste e solte ou clique para selecionar a imagem do ponto
              </p>
          )
      }
    </div>
  )
}

export default Dropzone;