import React, {
  forwardRef, LegacyRef,
} from 'react';
import './index.scss';

export interface IBaseInputProps{
}
/**
 * 输入框
 * */
const BaseInput = forwardRef((
  props:IBaseInputProps,
  editPanelRef:LegacyRef<HTMLDivElement>,
) => (
  <div className="react-im-input__base ">
    <div
      contentEditable="true"
      ref={editPanelRef}
      className="react-im-input__base-inner"
    />
  </div>
));

export default BaseInput;
