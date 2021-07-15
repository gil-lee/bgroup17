import React, { Component } from 'react'
import { Text, View, Alert } from 'react-native'
import AwesomeAlert from 'react-native-awesome-alerts';

const urlDeleteItem = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserItems/PutUserItemStatus";
const urlUser = "http://proj.ruppin.ac.il/bgroup17/prod/api/UserNew";

export default class DeleteItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showAlert: true,
      user: this.props.route.params.user,
      data: this.props.route.params.data
    }
  }

  deleteItem = () => {
    let newUser = '';
    fetch(urlDeleteItem + "/" + this.state.data.itemId + "/" + "deleted", {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
      })
    })
      .then(res => {
        console.log('res.ok PUTstatus item= ', res.ok);
        return res.json()
      })
      .then(i => {
        Alert.alert("שים/י לב", "הפריט נמחק מארונך האישי")

        fetch(urlUser, {
          method: 'GET',
          headers: new Headers({
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json; charset=UTF-8',
          })
        })
          .then(res => {
            console.log('res.ok getUsers= ', res.ok);
            return res.json()
          })
          .then(users => {
            
            for (let i = 0; i < users.length; i++) {
              if (users[i].email == this.state.user.email) {
                this.setState({ userAfterPut: users[i] })
                newUser = this.state.userAfterPut
                //console.log('user after put:   ', this.state.userAfterPut)
                this.setState({ showAlert: false })
              }
            }
            this.props.navigation.push('Navigator', { screen: 'Profile Page', params: { user: newUser } })
            this.props.navigation.navigate('Navigator', { screen: 'FeedPage', params: { user: newUser } })
          },
            (error) => {
              console.log('Error', error);
            })
      },
        (error) => {
          console.log('Error', error);
        })
  }

  render() {
    return (
      <View>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={false}
          title="מחיקת פריט"
          message="האם למחוק את הפריט?"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="לא"
          confirmText="כן"
          confirmButtonColor="#7DA476"
          onCancelPressed={() => {
            this.hideAlert();
          }}
          onConfirmPressed={() => {
            this.deleteItem();
          }}
        />
      </View>
    )
  }
}
