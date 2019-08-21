import React from 'react';
import { Text, View, ActivityIndicator, ScrollView, Dimensions, Button } from 'react-native';
import ModalSelector from 'react-native-modal-selector'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const API = "http://localhost:3000"

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        textInputValue: '',
        loading : false,
        columns : [],
        result:[],
        subCategorie:'',
        numberInstances:0,
        numberLinesNotDisplayed:0,
        buttonDisable:false
    }
  }

  componentDidMount(){
    this.setState({ loading:true })
    fetch(`${API}/columns`)
      .then(res => res.json())
      .then(data => {
        delete data[data.indexOf('age')]
        this.setState({loading:false, columns: data})
      })
  }

  async getColumnValues(columnName){
      this.setState({ loading:true })

      // fetch(`${API}/getValuesNumber?columnName=${columnName}`)
      // .then(res => res.json())
      // .then(data => {
      //   let objectSize =  data[0].values_number
      //   this.setState({numberInstances:objectSize, numberLinesNotDisplayed:objectSize-100})

      // })

      // fetch(`${API}/getValues?columnName=${columnName}&offset=${0}`)
      // .then(res => res.json())
      // .then(data => {
      //     this.setState({loading:false, result: data, subCategorie:columnName})
      // })

      const response1 = await fetch(`${API}/getValuesNumber?columnName=${columnName}`);
      const dataCount = await response1.json();
      let objectSize =  dataCount[0].values_number
      this.setState({numberInstances:objectSize, numberLinesNotDisplayed:objectSize-100})

      const response2 = await fetch(`${API}/getValues?columnName=${columnName}&offset=${0}`);
      const dataSet = await response2.json();
      this.setState({loading:false, result: dataSet, subCategorie:columnName})
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async handlePress(){
    this.setState({buttonDisable:true})
    let offset = this.state.result.length;
    let columnName = this.state.subCategorie;
    const res = await fetch(`${API}/getValues?columnName=${columnName}&offset=${offset}`);
    const dataSet = await res.json();
    const oldResult = this.state.result
    const newNumberLinesNotDisplayed = this.state.numberInstances - offset - 100
    this.setState({result:[...oldResult, ...dataSet], numberLinesNotDisplayed : newNumberLinesNotDisplayed < 0 ? 0 : newNumberLinesNotDisplayed });
    this.setState({buttonDisable:false})
  }

  render() { 
    let index = 0;
    const cat = []
    this.state.columns.map((column, i) => {cat.push({key:index++, label: this.capitalizeFirstLetter(column)})})

    return (
      <View style={{flex:1,  paddingTop:70, marginBottom:50}}>
          <View style={{ alignItems:'center'}}>
              <ModalSelector
                data={cat}
                initValue="Select a categorie"
                style={{borderRadius: 4, width: SCREEN_WIDTH/1.5}}
                selectTextStyle={{color:'#FFF', fontWeight:'bold',fontSize:17}}
                selectStyle={{backgroundColor:'#1E90FF'}}
                overlayStyle={{paddingTop:50, backgroundColor:'#404142'}}
                optionTextStyle={{color:'#1E90FF', fontWeight:'bold'}}
                cancelTextStyle={{color:'#000'}}
                optionContainerStyle={{backgroundColor:'#1E90FF'}}
                optionTextStyle={{color:'#FFF', fontWeight:'bold', fontSize:17}}
                cancelText={'CANCEL'}
                onChange={(option)=>{this.getColumnValues(option.label.toLowerCase())}} 
              />
          </View>
          
          <View style={{height:35, paddingLeft:15, justifyContent:'center'}}>
            {this.state.numberInstances>100 && !this.state.loading && <Text>Number of lines non-displayed: {this.state.numberLinesNotDisplayed}</Text>}
          </View>
  
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            {this.state.loading &&    
              <View style={{paddingTop:SCREEN_HEIGHT*0.25}}>
                <ActivityIndicator size='large' color="#1E90FF"/>
              </View>
            }
            <ScrollView>
              {!this.state.loading && this.state.result.map((result, i) => {
                  return(
                      <View key={i} style={{borderBottomColor:'#1E90FF', paddingVertical:15, borderBottomWidth:2 , width: SCREEN_WIDTH*0.9}}>
                        <View style={{flexDirection:'row'}}>
                          <Text>Categorie: </Text><Text style={{fontWeight:'bold'}}>{result[this.state.subCategorie]}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                          <Text>Count: </Text><Text style={{fontWeight:'bold'}}>{result.count}</Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                          <Text>Average Age: </Text><Text style={{fontWeight:'bold'}}>{Math.round(result.average_age * 10)/10}</Text>
                        </View>
                      </View>  
                  )
                })
              }
              {!this.state.loading && this.state.numberInstances>100 && this.state.numberLinesNotDisplayed &&
                <View style={{paddingTop:10}}>
                  <Button
                    onPress={() => this.handlePress()}
                    title="Load more"
                    color="#1E90FF"
                    disabled={this.state.buttonDisable}
                  />
              </View>
              }
            </ScrollView>
          </View>
      </View>
    );
  }
}