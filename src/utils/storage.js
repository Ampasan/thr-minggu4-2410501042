import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveData(key, value) {
  try {
    const raw = JSON.stringify(value);
    await AsyncStorage.setItem(key, raw);
    return true;
  } catch (e) {
    return false;
  }
}

export async function getData(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}
