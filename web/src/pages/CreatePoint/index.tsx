import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link, BrowserRouter, useHistory } from 'react-router-dom'
import {FiArrowLeft, FiAlertOctagon, FiTarget} from 'react-icons/fi';
import { Map, TileLayer, Marker, Popup} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

//importação de apis
import api from '../../services/api';
import Axios from 'axios';

import './styles.css';
import logo from '../../assets/logo.svg';
import { findAllByTitle } from '@testing-library/react';
import { REPL_MODE_SLOPPY } from 'repl';

import Dropzone from '../../components/Dropzone';

//sempre que se cria um estado para um array ou um objeto precisa manualmente imformar o tipo de variavel

interface Item {
   id: number;
   title: string;
   image_url: string;
}

interface IBGEUFResponse {
   sigla: string;
}

interface IBGECityResponse {
   id: number;
   nome: string;
}

const CreatePoint = () => {
   const [items, setItems] = useState<Item[]>([]);
   const [UFs, setUFs] = useState<string[]>([]);
   const [cities, setCities] = useState<IBGECityResponse[]>([]);

   const [inicialPosition, setInicialPosition] = useState<[number, number]>([0,0]);

   const [formData, setFormData] = useState({
      name: '',
      email: '',
      whatsapp: ''
   })

   const [selectedUF, setSelectedUF] = useState('0');
   const [selectedCity, setSelectedCity] = useState('0');
   const [selectedItems, setSelectedItems] = useState<number[]>([]);
   const [selectedLatLng, setSelectedLatLng] = useState<[number, number]>([0,0]);
   const [selectedFile, setSelectedFile] =useState<File>();
   
   const history = useHistory();


   useEffect(() => {
      navigator.geolocation.getCurrentPosition(position => {
         setInicialPosition([
            position.coords.latitude,
            position.coords.longitude,
         ])
      });
   }, []);

   useEffect(() => {
      api.get('items').then(response => {
         setItems(response.data);
      });
   }, []);

   useEffect(() => {
      Axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/').then(response => {
         setUFs(response.data.map(uf => uf.sigla));
      });
   }, []);

   useEffect(() => {
      if (selectedUF == '0') {
         return;
      }

      Axios.get<IBGECityResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/'+selectedUF +'/municipios').then(response => {
         const cities = response.data.map(city => {
            return {
               id: city.id,
               nome: city.nome
            }
         });

         setCities(cities);
      });

   }, [selectedUF]);

   function handleSelectedUF(event: ChangeEvent<HTMLSelectElement>){
      const UF = event.target.value;

      setSelectedUF(UF);
   }

   function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
      const city = event.target.value;

      console.log(city);

      setSelectedCity(city);
   }

   function handleMapClick(event: LeafletMouseEvent){
      console.log(event.latlng);

      setSelectedLatLng([
         event.latlng.lat,
         event.latlng.lng
      ])
   }

   function handleInputChange(event: ChangeEvent<HTMLInputElement>){
      const { name, value } = event.target;

      setFormData({ ...formData, [name]: value });
   }

   function handleItemClick(id:number){
      const alredySelected = selectedItems.findIndex(item => item === id);

      if(alredySelected >= 0){
         const filteredItems = selectedItems.filter(item => item !== id);

         setSelectedItems(filteredItems);
      } else {
         setSelectedItems([...selectedItems, id]);
      }
   }

   async function handleSubmit(event: FormEvent){
      event.preventDefault();

      const { name, email, whatsapp } = formData;
      const uf = selectedUF;
      const city = selectedCity;
      const [latitude, longitude] = selectedLatLng;
      const items = selectedItems;

      const data = new FormData();

      
      data.append('name', name);
      data.append('email', email);
      data.append('whatsapp', whatsapp);
      data.append('latitude', String(latitude));
      data.append('longitude', String(longitude));
      data.append('city', city);
      data.append('uf', uf);
      data.append('items', items.join(','));
      selectedFile && data.append('image', selectedFile);
      
 
      await api.post('points', data);

      alert('Ponto de coleta criado!');

      history.push('/');
   }

	return(
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta"/>
				<Link to="./">

					Voltar para home
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br/> ponto de coleta</h1>

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

               <Dropzone onFileUploaded={setSelectedFile}/>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input
							type="text"
							name="name"
                     id="name"
                     onChange={handleInputChange}
						/>
					</div>

					<div className="field-group">
						<div className="field">
							<label htmlFor="name">E-mail</label>
							<input
								type="email"
								name="email"
                        id="email"
                        onChange={handleInputChange}
							/>
						</div>
						<div className="field">
							<label htmlFor="name">WhatsApp</label>
							<input
								type="text"
								name="whatsapp"
                        id="whatsapp"
                        onChange={handleInputChange}
							/>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Endereço</h2>
                  <span>Selecione o endereço no mapa</span>
					</legend>

               <Map center={inicialPosition} zoom={13} onClick={handleMapClick}>
                  <TileLayer 
                     attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={selectedLatLng} />
               </Map>

               <div className="field-group">
                  <div className="field">
                     <label htmlFor="uf">Estado (UF)</label>
                     <select onChange={handleSelectedUF} name="uf" id="uf" value={selectedUF}>
                        <option value="0">Selecione uma UF</option>
                        {UFs.map(UF => (
                           <option key={UF} value={UF}>{UF}</option>
                        ))}
                     </select>
                  </div>

                  <div className="field">
                     <label htmlFor="cidade">Cidade</label>
                     <select  onChange={handleSelectedCity} name="city" id="city" value={selectedCity}>
                        <option value="0">Selecione uma cidade</option>
                        {cities.map(city => (
                           <option value={city.nome} key={city.id}>{city.nome}</option>
                        ))}
                     </select>
                  </div>
               </div>
   
				</fieldset>

				<fieldset>
					<legend>
						<h2>Itens de coleta</h2>
                  <span>Selecione um ou mais itens de coleta</span>
					</legend>

               <ul className="items-grid">
                  {
                     items.map(item => (
                        <li 
                           key={item.id} 
                           onClick={() => handleItemClick(item.id)} 
                           value={item.title}
                           className={selectedItems.includes(item.id) ? 'selected' : ''}
                        >
                           <img src={item.image_url} alt={item.title}/>
                           <span>{item.title}</span>
                        </li>
                     ))
                  }
                  
                  
               </ul>
				</fieldset>

            <button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
	);
};

export default CreatePoint;