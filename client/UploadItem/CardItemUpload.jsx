import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CardItemUpload(props) {

  
  return (
    <View>
      <View style={styles.line}/>
      <View style={styles.layout}>
        <View style={styles.header}>
          <Text style={{ fontWeight: "bold" }}>{props.data.name}  |  </Text>
          <Text>  {props.data.type}  |</Text>

          <Text>{props.data.numberOfPoints}  </Text>
          <MaterialCommunityIcons name="cash" color={"#7DA476"} size={20} />
        </View>
        {props.data.description ?
          <Text style={{ marginRight: 10, marginLeft: 10 }}>{props.data.description}</Text> : null}
      </View>
      <View style={{ height: 270, flexDirection: 'row', justifyContent: 'center' , marginTop: 15 }} >
        {props.data.image1 &&
          <Image source={{ uri: props.data.image1 }} style={{ height: 270, width: 200, borderColor: '#fff', borderWidth: 2 }}></Image>}

        <View>
          {props.data.image2 ?
            <Image source={{ uri: props.data.image2 }} style={{ height: 90, width: 100, borderColor: '#fff', borderWidth: 2 }}></Image> : null}

          {props.data.image3 ?
            <Image source={{ uri: props.data.image3 }} style={{ height: 90, width: 100, borderColor: '#fff', borderWidth: 2 }}></Image> : null}

          {props.data.image4 ?
            <Image source={{ uri: props.data.image4 }} style={{ height: 90, width: 100, borderColor: '#fff', borderWidth: 2 }}></Image> : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontWeight: "bold" }}>{props.data.condition}  |  </Text>
        <Text style={{ fontWeight: "bold" }}>{props.data.size}  </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    marginTop: 35,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10
  },
  footer: {
    flexDirection: 'row-reverse',
    marginLeft: 32,
  },
  layout: {
    marginRight: 20,
    marginLeft: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  line: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: -20,
    borderBottomColor: '#a7a7a7',
    borderBottomWidth: 1
  }
})
