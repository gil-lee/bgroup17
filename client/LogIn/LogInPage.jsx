import React, { Component } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ImageBackground,Switch, Image, Alert } from 'react-native'

export default class LogInPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      rememberMe: false,
      username: '',
      userLogIn: '',
    }
  }

  // async componentDidMount() {
  //   const userLogIn = await this.getRememberedUser();
  //   this.setState({
  //     userLogIn: userLogIn || "",
  //     rememberMe: userLogIn ? true : false
  //   });
  // }

  btnSignUp = () => {
    this.props.navigation.navigate('Sign Up')
  }

  // rememberUser = async () => {
  //   try {
  //     const value = JSON.stringify(this.state.userLogIn)
  //     await AsyncStorage.setItem('user', value);
  //   } catch (e) {
  //     console.log('error saving to async storge.. ', e.error)
  //   }
  // }
  // getRememberedUser = async () => {
  //   try {
  //     const userLogIn = await AsyncStorage.getItem('user');
  //     var user= JSON.parse(userLogIn);
  //     if (user !== null) {
  //       //return userLogIn;
  //       this.props.navigation.navigate('Navigator', { screen: 'UploadDetails', params: { user: user[0] }, initial: false })
  //       this.props.navigation.navigate('Navigator', { screen: 'Profile Page', params: { user: user[0] }, initial: false })
  //       this.props.navigation.navigate('Navigator', { screen: 'Favorite', params: { user: user[0] }, initial: false })
  //       this.props.navigation.navigate('Navigator', { screen: 'Main Chat Page', params: { user: user[0] }, initial: false })
  //       this.props.navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: user[0] } })
  //     }
  //   } catch (e) {
  //     console.log('error get from async storage', e.error)
  //   }
  // };
  // forgetUser = async () => {
  //   try {
  //     await AsyncStorage.removeItem('user');
  //   } catch (error) {
  //     console.log('error remone from async storage', e.error)

  //   }
  // };
  // toggleRememberMe = value => {
  //   this.setState({ rememberMe: value })
  //   if (value === true) {
  //     this.rememberUser();
  //   } else {
  //     this.forgetUser();
  //   }
  // }
  btnLogIn = () => {

    const url = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew/logIn";

    fetch(url + '/' + this.state.email + '/' + this.state.password, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        return res.json()
      })
      .then(tempUser => {
        this.setState({ userLogIn: tempUser }
          //, () => console.log('user from login: ', tempUser)
          )
        if (tempUser.length > 1) {
          Alert.alert("אופס...", "קיימת שגיאה בכתובת האימייל או בסיסמה")
        }
        else {
          this.props.navigation.navigate('Navigator', { screen: 'UploadDetails', params: { user: tempUser[0] }, initial: false })
          this.props.navigation.navigate('Navigator', { screen: 'Profile Page', params: { user: tempUser[0] }, initial: false })
          this.props.navigation.navigate('Navigator', { screen: 'Favorite', params: { user: tempUser[0] }, initial: false })
          this.props.navigation.navigate('Navigator', { screen: 'Main Chat Page', params: { user: tempUser[0] }, initial: false })
          this.props.navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: tempUser[0] } })
        }
      },
        (error) => {
          console.log('Error', error);
        })
  }

  render() {
    return (
      <ImageBackground source={require('../assets/bgImage.png')} style={styles.image}>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text></Text>
          <View style={styles.inputView} >
            <TextInput
              style={styles.inputText}
              placeholder="אימייל"
              placeholderTextColor="#A7A7A7"
              textAlign={'center'}
              autoCapitalize="none"
              onChangeText={text => this.setState({ email: text })} />
          </View>
          <View style={styles.inputView} >
            <TextInput
              secureTextEntry
              style={styles.inputText}
              placeholder="סיסמה"
              placeholderTextColor="#A7A7A7"
              textAlign={'center'}
              onChangeText={text => this.setState({ password: text })} />
          </View>

          {/* <TouchableOpacity onPress={this.saveToAsyncStorgae}>
            <Text style={styles.forgot}>זכור אותי</Text>
          </TouchableOpacity> */}
          {/* <View style={styles.switchRemember}>
          <Text style={styles.remember}>זכור אותי</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#7DA476" }}
            thumbColor={this.state.rememberMe ? "#f4f3f4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            value={this.state.rememberMe}
            onValueChange={(value) => this.setState({ rememberMe: value })}
          /> */}
          {/* </View> */}
          <TouchableOpacity style={styles.loginBtn} onPress={this.btnLogIn}>
            <Text style={styles.loginText}>התחברות</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.regBtn} onPress={this.btnSignUp}>
            <Text style={styles.regText}>הרשמה</Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%"
  },
  switchRemember:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputView: {
    width: "80%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#A7A7A7",
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20
  },
  inputText: {
    height: 50,
    color: "#101010"
  },
  loginText: {
    color: "white",
    fontSize: 18
  },
  regText: {
    color: "white",
    fontSize: 14
  },
  remember: {
    color: "#101010",
    fontSize: 14,
    marginRight: 5
  },
  loginBtn: {
    width: "80%",
    backgroundColor: "#7DA476",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10
  },
  regBtn: {
    width: 80,
    backgroundColor: "#9d76a5",
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10
  },
  logo: {
    width: 300,
    height: 150
  }
})