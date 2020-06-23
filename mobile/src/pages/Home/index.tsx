import React , { useState, useEffect }from 'react';
import { Feather as Icon} from '@expo/vector-icons'
import { StyleSheet, Text, View, Image, ImageBackground, KeyboardAvoidingView, Platform, Picker, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';

interface IBGEUFResponse {
	sigla: string;
}

interface IBGECityResponse {
	id: number;
	nome: string;
}

const Home = () => {
	const [uf, setUf] = useState<string>('Selecione seu estado... ');
	const [city, setCity] = useState<string>('Selecione sea cidade... ');

	const [UFs, setUFs] = useState<string[]>([]);
	const [citys, setCitys] = useState<IBGECityResponse[]>([]);

	const navigation = useNavigation();

	function handleNavigateToPoints(){
		if(uf !== 'Selecione seu estado... ' || city !== 'Selecione sea cidade... '){
			navigation.navigate('Points', {
				uf,
				city,
			});
		}
	}

	useEffect(() => {
		Axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			setUFs(response.data.map(UF => {
				return UF.sigla;
			}));
		})
	}, []);


	useEffect(() => {
		if(uf !== 'Selecione seu estado... '){
			Axios.get<IBGECityResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + uf + '/municipios').then(response =>{
			setCitys(response.data.map(city => {
				return city;
			}));
		})
		}	
	}, [uf])


	return(
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<ImageBackground 
				source={require('../../assets/home-background.png')} 
				style={styles.container}
				imageStyle={{ width: 274, height: 368 }}
			>
				<View style={styles.main}>
					<Image source={require('../../assets/logo.png')} />
						<View>
							<Text style={styles.title}>Seu marketplace de coletra de resíduos.</Text>
							<Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
						</View>
					</View>

				<View	style={styles.footer}>
					<View style={styles.pickerContainer}>
						<Picker 
							style={styles.picker} 
							itemStyle={styles.pickerItem}
							onValueChange={(itemValue) => setUf(itemValue)}
						>
							<Picker.Item label={uf} value={null}/>
							{UFs.map(UF => {
								return (
									<Picker.Item key={UF} label={UF} value={UF}/>
								)
							})}
						</Picker>
					</View>

					<View style={styles.pickerContainer}>
						<Picker 
							style={styles.picker} 
							itemStyle={styles.pickerItem}
							onValueChange={(itemValue) => setCity(itemValue)}
						>
							<Picker.Item label={city} value={null}/>
							{citys.map(city => {
								return (
									<Picker.Item key={city.id} label={city.nome} value={city.nome}/>
								)
							})}
						</Picker>
					</View>

					<RectButton style={styles.button} onPress={handleNavigateToPoints}>
						<View style={styles.buttonIcon}>
							<Icon name='arrow-right' color='#fff' size={24} />
						</View>
						<Text style={styles.buttonText}>
							Entrar
						</Text>
					</RectButton>
				</View>
			</ImageBackground>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	pickerContainer: {
		height: 60,
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 8,
		paddingHorizontal: 16,
		fontSize: 16,
		
	},
	picker: {
		height: 60,
		color: '#70757a',
	},

	pickerItem: {
		padding: 50,
	},	

	container: {
		flex: 1,
		padding: 32
	},
  
	main: {
		flex: 1,
		justifyContent: 'center',
	},
  
	title: {
		color: '#322153',
		fontSize: 32,
		fontFamily: 'Ubuntu_700Bold',
		maxWidth: 260,
		marginTop: 64,
	},
  
	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 16,
		fontFamily: 'Roboto_400Regular',
		maxWidth: 260,
		lineHeight: 24,
	},
  
	footer: {},
  
	select: {},
  
	input: {
		height: 60,
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 8,
		paddingHorizontal: 24,
		fontSize: 16,
	},
  
	button: {
		backgroundColor: '#34CB79',
		height: 60,
		flexDirection: 'row',
		borderRadius: 10,
		overflow: 'hidden',
		alignItems: 'center',
		marginTop: 8,
	},
  
	buttonIcon: {
		height: 60,
		width: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center'
	},
  
	buttonText: {
		flex: 1,
		justifyContent: 'center',
		textAlign: 'center',
		color: '#FFF',
		fontFamily: 'Roboto_500Medium',
		fontSize: 16,
	}
});

export default Home;