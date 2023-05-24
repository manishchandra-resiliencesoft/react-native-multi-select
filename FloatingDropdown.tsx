import {
  StyleSheet,
  Text,
  Pressable,
  Modal,
  FlatList,
  View,
  Animated,
  ViewStyle,
  TextInput,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import React, {useEffect, useRef, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextExtended from '../text/TextExtended';
import CustomIcons from '../../atoms/icon/CustomIcons';
import {COLORS} from '../../../themes/Colors';
// import NoResultFoundDropDown from '../../molecule/NoResultFoundDropDown';

type FloatingDropdownProps = {
  label: string;
  data: any[];
  uniqueKey: string;
  displayKey: string;
  selectedItems: any;
  errors?: string;
  showSearch?: boolean;
  touched?: boolean;
  onSelectedItemsChange: (value: string) => void;
  pickerContainerStyle: ViewStyle;
  labelContainer: ViewStyle;
  labelContainer2: ViewStyle;
  selectedText: ViewStyle;
  errorTextStyle: ViewStyle;
  defaultValue?: string;
  rightIcon?: string;
  rightIconSize?: number;
  mode: 'single' | 'multiple';
};

const FloatingDropdown: React.FC<FloatingDropdownProps> = props => {
  const {
    label,
    labelContainer,
    labelContainer2,
    data,
    uniqueKey,
    displayKey,
    touched,
    showSearch,
    errors,
    selectedItems,
    defaultValue,
    rightIconSize,
    rightIcon,
    errorTextStyle,
    onSelectedItemsChange,
    pickerContainerStyle,
    mode,
  } = props;
  const [showListModal, setShowListModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [list, setList] = useState(data);
  const [selectedData, setSelectedData] = useState([]);

  const moveText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('HELLO LOVE');
    setList(data);
  }, [data]);

  useEffect(() => {
    if (selectedItems?.length > 0) {
      moveTextTop();
    } else if (selectedItems?.length === 0) {
      moveTextBottom();
    }
  }, [selectedItems]);

  const moveTextTop = () => {
    Animated.timing(moveText, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const moveTextBottom = () => {
    Animated.timing(moveText, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const yVal = moveText.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const animStyle = {
    transform: [
      {
        translateY: yVal,
      },
    ],
    fontSize: moveText.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 15],
    }),
    color: moveText.interpolate({
      inputRange: [0, 1],
      outputRange: ['#a1a1a1', '#fff'],
    }),
  };

  const selectedItemData = data.find(item => {
    if (selectedItems?.length > 0) {
      return selectedItems[0] === item[uniqueKey];
    }
  });

  const handleSelectItem = item => {
    if (mode === 'single') {
      onSelectedItemsChange([item[uniqueKey]]);
      setShowListModal(false);
      return;
    }

    setSelectedData(preVal => {
      if (!preVal.includes(item[uniqueKey])) {
        return [...preVal, item[uniqueKey]];
      } else {
        const newVal = preVal.filter(
          preValItem => preValItem !== item[uniqueKey],
        );
        return newVal;
      }
    });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text === '') {
      setList(data);
      return;
    }

    const searchedCity = data.filter(item =>
      item.cityName
        ? item.cityName.startsWith(text)
        : item.name
        ? item.name.startsWith(text)
        : false,
    );
    if (searchedCity) {
      setList(searchedCity);
    } else {
      setList(data);
    }
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setList(data);
  };

  const handleSubmit = () => {
    onSelectedItemsChange(selectedData);
    setShowListModal(false);
  };

  const renderListModal = data => {
    const handleRenderHeader = () => (
      <View style={[styles.labelContainer, labelContainer]}>
        <Text style={styles.labelHeaderText}>{label}</Text>
        <MaterialIcons
          onPress={handleCloseModal}
          name="close"
          size={25}
          color="#fff"
        />
      </View>
    );
    const handleRenderItem = ({item}) => (
      <Pressable
        onPress={() => handleSelectItem(item)}
        style={styles.dataListContainer}>
        <View style={{flexDirection: 'row', alignContent: 'center'}}>
          {mode === 'multiple' ? (
            selectedData.includes(item[uniqueKey]) ? (
              <MaterialIcons
                name="check-circle-outline"
                size={25}
                color={COLORS.PRIMARY_LEFT}
                style={styles.selectedItemIcon}
              />
            ) : (
              <MaterialIcons
                name="radio-button-unchecked"
                size={25}
                color={COLORS.PRIMARY_LEFT}
                style={styles.selectedItemIcon}
              />
            )
          ) : (
            selectedData.includes(item[uniqueKey])
          )}
          <View style={{flex: 1}}>
            <Text style={styles.listItemText}>{item[displayKey]}</Text>
          </View>
        </View>
      </Pressable>
    );
    return (
      <Modal transparent={true} visible={showListModal}>
        <View style={styles.overlay} />
        <View style={styles.listContainer}>
          <View style={styles.modalContainer}>
            {handleRenderHeader()}
            {showSearch ? (
              <View style={styles.search}>
                <Ionicons name="md-search-circle-outline" size={20} />
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={{
                    width: wp('65'),
                  }}
                  value={searchText}
                  onChangeText={handleSearch}
                  placeholder="Search"
                />
                {errors && touched ? (
                  <Text style={styles.error}>{errors}</Text>
                ) : null}
              </View>
            ) : null}
            <FlatList
              data={list}
              renderItem={handleRenderItem}
              //   ListEmptyComponent={<NoResultFoundDropDown />}
              keyExtractor={(item, index) => index.toString()}
            />
            {mode === 'multiple' && (
              <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonTextStyle}>Submit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const handlePickerPress = () => {
    setShowListModal(true);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePickerPress}
        style={StyleSheet.flatten([
          styles.pickerContainer,
          pickerContainerStyle,
        ])}>
        {/* <Animated.Text style={[styles.labelText, animStyle]}>
          {label}
        </Animated.Text> */}
        <View style={[styles.labelContainer2, labelContainer2]}>
          <TextExtended color={COLORS.PRIMARY} size={12}>
            {label}
          </TextExtended>
        </View>

        {selectedItemData ? (
          <View style={{flexDirection: 'row'}}>
            <CustomIcons
              name={rightIcon}
              size={rightIconSize}
              color={COLORS.PRIMARY}
              style={styles.rightIconStyle}
            />
            <Text style={styles.selectedText}>
              {selectedItemData ? selectedItemData[displayKey] : null}
            </Text>
          </View>
        ) : (
          <View style={{flexDirection: 'row'}}>
            <CustomIcons
              name={rightIcon}
              size={rightIconSize}
              color={COLORS.PRIMARY}
              style={styles.rightIconStyle}
            />
            <Text style={styles.selectedText}>{defaultValue}</Text>
          </View>
        )}
      </Pressable>
      {renderListModal(data)}
      {errors ? (
        <Text style={[styles.error, errorTextStyle]}>{errors?.message}</Text>
      ) : null}
    </View>
  );
};

export default FloatingDropdown;

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    borderColor: '#000',
    height: hp('6'),
    borderWidth: 1,
    paddingLeft: 10,
    margin: 10,
    alignItems: 'center',
    borderRadius: 50,
  },
  container: {
    flex: 1,
  },
  pickerContainer: {
    // flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 50,
  },
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 30,
    marginVertical: 100,
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dataListContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#a1a1a1',
  },
  selectedItemIcon: {
    color: COLORS.PRIMARY_LEFT,
    // paddingVertical: 20,
    alignSelf: 'center',
    left: 10,
  },
  listItemText: {
    color: '#333',
    padding: 18,
  },
  rightIconStyle: {
    paddingHorizontal: wp(1),
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#C3773B',
  },
  labelContainer2: {
    backgroundColor: COLORS.WHITE,
    alignSelf: 'flex-start',
    paddingHorizontal: wp(2),
    marginStart: 25,
    zIndex: 1,
    elevation: 1,
    shadowColor: COLORS.WHITE,
    position: 'absolute',
    top: -12,
  },
  labelText: {
    position: 'absolute',
    left: 12,
    fontSize: 18,
    color: '#aaa',
    fontWeight: 'normal',
  },
  labelHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  selectedText: {
    color: '#333',
    marginLeft: wp(1),
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    opacity: 0.8,
  },
  error: {
    color: COLORS.RED_DARK,
    alignSelf: 'flex-end',
    fontSize: hp('1.5'),
    marginHorizontal: wp(3),
  },
  submitButton: {
    height: 40,
    width: 280,
    marginVertical: 15,
    bottom: -2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_LEFT,
  },
  buttonTextStyle: {
    color: COLORS.WHITE,
    fontSize: 20,
  },
});
