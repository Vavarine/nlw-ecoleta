import Axios from 'axios';

const apiIBGE = Axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/'
});

export default apiIBGE;