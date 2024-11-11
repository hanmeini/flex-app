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

function OnboardingScreen({ navigation }:any)  {

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleSkip = () => {
      // Navigasi ke layar login atau halaman utama
      navigation.navigate('AppNavigator');
    };
  
    const handleGetStarted = () => {
      // Navigasi ke layar utama aplikasi atau layar berikutnya
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
          {/* Tampilkan tombol "Get Started" dan teks "Skip" hanya di gambar terakhir */}
          {index === data.length - 1 && (
            <View style={styles.footer}>
              {/* Tombol Get Started */}
              <TouchableOpacity 
                style={styles.getStartedButton} 
                onPress={handleGetStarted} // Menggunakan navigation.navigate di sini
              >
                <Text style={styles.getStartedText}>Get Started</Text>
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
    backgroundColor: '#ffd91b',
    width: 35,
    height: 4,
    borderRadius: 3,
    marginHorizontal: 5,
  },
   getStartedButton: {
    backgroundColor: '#F4AB05',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  getStartedText: {
    fontSize: 16,
    color: '#1A2529 ',
    fontFamily: 'figtree-semibold',
    
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 50,
  },
  skipText: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'figtree-semibold'
  },

});
