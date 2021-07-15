import React, { Component } from 'react'
import {  View, Modal, TouchableOpacity } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/FontAwesome';


export default class ZoomImages extends Component {
  constructor(props) {
    super(props),
      this.state = {
        images: this.props.route.params,
        visible: true
      }
  }

  componentDidMount() {
    //console.log('images in zoom: ', this.state.images);
    this.filterImages()
  }

  filterImages = () => {
    let temp = []
    let tempArr = [];
    for (let i = 0; i < this.state.images.length; i++) {
      temp = this.state.images
      if (temp[i].url !== "") {
        tempArr.push(temp[i])
      }
    }
    this.setState({ images: tempArr })
  }

  closeModal = () => {
    this.setState({ visible: false })
    this.props.navigation.goBack()
  }

  render() {
    return (
      <View>
        <Modal visible={this.state.visible} transparent={true} animationType="slide">
          <TouchableOpacity onPress={this.closeModal} style={{ backgroundColor: '#000' }}>
            <Icon name="close" size={20} color="#fff" style={{ marginTop: 50, marginRight: 20, marginLeft: 20 }} />
          </TouchableOpacity>
          <ImageViewer imageUrls={this.state.images} />
        </Modal>
      </View>
    )
  }
}
