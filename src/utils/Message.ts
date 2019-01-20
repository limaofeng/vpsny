import DropdownAlert from 'react-native-dropdownalert';
let _dropdown: DropdownAlert | null;
export default {
  error(message: string) {
    _dropdown!.alertWithType('error', 'Error', message);
  },
  info(title: string, message: string) {
    _dropdown!.alertWithType('info', title, message);
  },
  success(message: string) {
    _dropdown!.alertWithType('success', 'Success', message);
  },
  setDropdown(dropdown: DropdownAlert | null) {
    _dropdown = dropdown;
  }
};
