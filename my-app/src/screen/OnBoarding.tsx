import React, { useState } from 'react';
import { StyleSheet, View, Text, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

const data = [
  {
    image: require('../../assets/images/onboarding1.png'),
  },
  {
    image: require('../../assets/images/onboarding2.png'),
  },
  {
    image: require('../../assets/images/onboarding3.png'),
  },
];

function OnboardingScreen({ navigation }: any) {

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = () => {
    navigation.navigate('AppNavigator');
  };

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleIndexChanged = (index: any) => {
    setCurrentIndex(index);
  };

  return (
    <Swiper
      style={styles.wrapper}
      showsButtons={false}
      loop={false}
      onIndexChanged={handleIndexChanged}
      scrollEnabled={currentIndex !== data.length - 1}  // Disable scroll on the last slide
      dotStyle={currentIndex === data.length - 1 ? { display: 'none' } : styles.dot}
      activeDotStyle={currentIndex === data.length - 1 ? { display: 'none' } : styles.activeDot}
      dot={currentIndex === data.length - 1 ? <View style={{ display: 'none' }} /> : <View style={styles.dot} />}
      activeDot={currentIndex === data.length - 1 ? <View style={{ display: 'none' }} /> : <View style={styles.activeDot} />}
    >
      {data.map((item, index) => (
        <View style={styles.slide} key={index}>
          <ImageBackground source={item.image} style={styles.imageBackground}>
            {/* Tampilkan tombol "Sign Up" dan "Login" hanya di gambar terakhir */}
            {index === data.length - 1 && (
              <View style={styles.footer}>
                {/* Tombol Sign Up */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                >
                  <Text style={styles.buttonText2}>Sign Up</Text>
                </TouchableOpacity>
                
                {/* Tombol Login */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>
              </View>
            )}
          </ImageBackground>
        </View>
      ))}
    </Swiper>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  imageBackground: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dot: {
    backgroundColor: '#ffffff',
    width: 15,
    height: 4,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fbab05',
    width: 35,
    height: 4,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 50,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f4ab05',
    paddingHorizontal: 45,
    borderRadius: 10,
    
  },
  loginButton: {
    backgroundColor: '#f4ab05',
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 10,
    
  },
  buttonText: {
    fontSize: 18,
    color: '#1A2529',
    fontFamily: 'figtree-semibold',
  },
  buttonText2: {
    fontSize: 18,
    color: '#f4ab05',
    fontFamily: 'figtree-semibold',
  },


});
