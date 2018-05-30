import React, {Component} from 'react';
import ReactNative from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {ActionCreators} from '../actions';
import {bindActionCreators} from 'redux';
import Button from 'react-native-smart-button';
import _ld from 'lodash';
import {connect} from 'react-redux';

const{
	ScrollView,
	View,
	Text,
	Image,
	TouchableHighlight,
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	NatigatorIOS,
	TextInput,
} = ReactNative;



class Home extends Component {

constructor(props) {
	  super(props);
	  console.log(props);		
	  this.state = {
	  	myinput: '', 
	  	searching: false, 
	  	localSearch: false, 
	  	localData: [], 
	  	callBackFlag: false 
	  };
	  this.flag = false;
	  this.ApiCall = false;
	  this.oldInput = '';
	}

componentWillMount() {
	console.log('component mounting....');
	this.searchPressed();
}

filter(input){
	this.oldInput = this.state.myinput;
	this.setState({ myinput : input }, () =>{
		console.log('State',this.state.myinput);
	}) ;
	this.setState({localSearch : true});
	//console.log("Event",input);
	var tempCharacterState = this.props.displayCharacters;
	tempCharacterState = _ld.filter(tempCharacterState, function(user){
		return _ld.includes(user.name.toLowerCase(), input.toLowerCase());
	});	
	console.log('temp state after filtering',tempCharacterState);
	this.setState({localData : tempCharacterState}, ()=>{
		console.log('local data obj', this.state.localData);
	});
}

searchPressed(){
		//console.log("Pressed");
		this.setState({searching: true});
		this.props.marvelGetCharacters(this.state.myinput).then( () =>
				this.setState({searching: false}));
	}	

getCharacters(){
	//console.log("Get Data now",this.props.displayCharacters);
	return Object.keys(this.props.displayCharacters).map(
		key => this.props.displayCharacters[key]);
}

getSearchedCharacters(){
	//console.log("Get Data now",this.props.displaySearchedCharacters);
	return Object.keys(this.props.displaySearchedCharacters).map(
		key => this.props.displaySearchedCharacters[key]);
}

getList(){
	console.log('Condition');
	var timeout = null;
	let that = this;
	if(!this.state.localSearch && !this.ApiCall) {
		console.log("Condition 1 ");
		const marvelCharacters = this.getCharacters();
		//console.log('character data', marvelCharacters);
		//console.log('Api wala flag',this.ApiCall);
		//console.log('flag wala flag', this.flag);
		if(!this.state.searching && marvelCharacters.length){
				//var imgPath = marvelCharacter.thumbnail.path + marvelGetCharacter.thumbnail.extension;
				return marvelCharacters.map((marvelGetCharacter) =>{ 
				return (<View key={marvelGetCharacter.id}>
					<Image source={{uri: marvelGetCharacter.thumbnail.path + '.' + marvelGetCharacter.thumbnail.extension}} style={styles.resultImage} />
					<Text style={styles.resultText}>{marvelGetCharacter.name}</Text>
				  </View>);
				});
		}

		return(<View style={{ flex: 1 }}>
	        <Spinner visible={this.state.searching} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
	      </View>)
}
		// console.log()
	else if (this.ApiCall && this.state.callBackFlag){
		console.log("Condition 2");
		console.log('searching state',this.state.searching);
		this.ApiCall = false;
		//this.setState({callBackFlag: false});
		const marvelCharacters = this.getSearchedCharacters();
		console.log('searhced charactes from API', marvelCharacters);
		//console.log('searching', this.state.searching);
		if(!this.state.searching && marvelCharacters.length){
			console.log("Condition 2.5",marvelCharacters);
			return marvelCharacters.map((marvelGetCharacter) =>{ 
				return (<View key={marvelGetCharacter.id}>
					<Image source={{uri: marvelGetCharacter.thumbnail.path + '.' + marvelGetCharacter.thumbnail.extension}} style={styles.resultImage} />
					<Text style={styles.resultText}>{marvelGetCharacter.name}</Text>
				  </View>);
				});
		}

		return(<View style={{ flex: 1 }}>
	        <Spinner visible={this.state.searching} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
	      </View>)

	}

	else {
		
		console.log("Condition 3");
		console.log('local search', this.state.localSearch);
		console.log('local search API flag', this.flag);
		console.log('ApiCall flag',this.ApiCall);
		//const marvelCharacters = this.getLocalCharacters();
		if(!(_ld.isEmpty(this.state.localData)) && this.state.localSearch){
				const marvelGetCharacters = this.state.localData;
				console.log("condition 3.1");
				return marvelGetCharacters.map((marvelGetCharacter) => {
					return (<View key={marvelGetCharacter.id}>
							<Image source={{uri: marvelGetCharacter.thumbnail.path + '.' + marvelGetCharacter.thumbnail.extension}} style={styles.resultImage} />
							<Text style={styles.resultText}>{marvelGetCharacter.name}</Text>
							</View>);
				});
		}
		else{
			console.log("condition 3.2");
			if(_ld.isEmpty(this.state.localData) && !(this.flag) && this.oldInput <= this.state.myinput) {
				this.flag = true;
				console.log('gets inside condition before timeout', this.flag);
				setTimeout(() => {
					console.log('time expired calling API...');
					
					//console.log('Api call should change', that.ApiCall);
					//this.flag = false;
					that.ApiCall = true;
					console.log("api flag set",that.ApiCall);
					this.setState({searching: true});
					this.props.marvelGetSearchCharacters(this.state.myinput).then( () =>
					{
						this.setState({searching: false});
						this.setState({localSearch : false});
						this.setState({callBackFlag: true});
						console.log('then',that.ApiCall);
					  this.flag = false;
					});
					
					
				}, 2000);
				
			}
		}
	//}
	}
} 

closeKeyboard(){
	Keyboard.dismiss();
}

callit(){
	Keyboard.dismiss();
	this.searchPressed()
}

	render(){
		return(
				<TouchableWithoutFeedback onPress={this.closeKeyboard}>
					<View style={styles.scene}>
						<View style={styles.navbar}>
							<Text style={styles.navbarText}>Welcome {this.props.text}</Text>
							<Text style={styles.navbarButton}>Menu</Text>
						</View>
						<View style={styles.searchSection}>
							<TextInput style={styles.searchInput}
								placeholder='Add search query...'
								onChangeText={this.filter.bind(this)}
							/>
							<TouchableHighlight style={styles.searchButton} onPress={this.callit.bind(this)} >
								<Text style={styles.searchButtonText}>
									Roll Out!
								</Text>
							</TouchableHighlight>
						</View>
						<ScrollView style={styles.scrollSection}>
							{this.getList()}
						</ScrollView>
					</View>
				</TouchableWithoutFeedback>
			)
	}
}
//{this.getList()} this was inside the scroll view
//StyleSheet Component
const styles= StyleSheet.create({
	scene:{
		flex: 1,
		marginTop: 0,
	},

	searchSection:{
		height: 40,
		borderBottomColor: '#000',
		borderBottomWidth: 1,
		
		flexDirection: 'row'
	},
	searchButton:{
		flex: 0.3,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#D3D3D3',
		borderWidth: 10,
		borderRadius: 20,
		borderColor: '#D3D3D3',
		padding: 5,
	},
	searchButtonText:{
		fontSize: 20,
	},
	searchBarText:{
		fontSize: 20,
		fontWeight: 'bold',
		
	},
	scrollSection:{
		flex: 0.8

	},
	resultText:{
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFF',
		backgroundColor: '#000'
	},
	resultImage:{
		height: 150,
	},
	searchInput:{
		flex: 0.7,
		height: 40,
		fontSize: 18,

	},
	navbar:{
		flexDirection: 'column',
		height: 60,
		justifyContent: 'center'
		
	},
	navbarText:{
		fontSize: 15,
		fontWeight: 'bold',
		backgroundColor: 'black',
		color: 'white',
		paddingLeft: 15,
		textAlign: 'center'
	},
	navbarButton:{
		fontSize: 15,
		color: 'white',
		backgroundColor: 'black',
		textAlign: 'left',
		paddingLeft: 10,
		paddingBottom: 10,
		justifyContent: 'center'
	}

});

function mapStateToProps(state){
	//console.log("State Data",state.displaySearchedCharacters);
	return{displayCharacters: state.displayCharacters, displaySearchedCharacters: state.displaySearchedCharacters}
}
function mapDispatchToProps(dispatch) {
	return bindActionCreators(ActionCreators, dispatch);
}
export default connect(mapStateToProps,mapDispatchToProps)(Home);