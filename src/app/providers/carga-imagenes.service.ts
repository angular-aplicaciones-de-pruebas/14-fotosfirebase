import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app'
import { FileItem } from '../models/file-item';
@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  private CARPETA_IMAGEN:string ='img'

  constructor(public db: AngularFirestore) { }

  cargaImagenesFirebase(imagenes:FileItem[]){
    const storageRef = firebase.storage().ref();
    for(const item of imagenes){
      item.estaSubiendo = true;
      if(item.progreso>=100){
        continue;
      }
      const imageReference = storageRef.child(`${this.CARPETA_IMAGEN}/${item.nombreArchivo}`)
      const uploadTask : firebase.storage.UploadTask = imageReference.put(item.archivo);
       uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                    (snapshot:firebase.storage.UploadTaskSnapshot)=>
                      item.progreso = (snapshot.bytesTransferred/snapshot.totalBytes)*100,
                    (error) =>{console.error('Error al subir',error)},
                    () =>{
                      imageReference.getDownloadURL().then(
                        (imageUrl) => {
                            console.log('Imagen cargada correctamente');
                            item.url = imageUrl;
                            item.estaSubiendo  = false;
                            this.guardarImagen({nombre: item.nombreArchivo,url: item.url});
                          });
                        });
    }

  }

  private guardarImagen(imagen:{nombre:string, url:string}){
    this.db.collection(`/${this.CARPETA_IMAGEN}`)
        .add( imagen );
  }
}
