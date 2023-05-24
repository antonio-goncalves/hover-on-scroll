import React from 'react';
import * as  ReactDOM from 'react-dom'
import {Main} from "./main";
import HoverOnScroll from "../src";
window.HoverOnScroll = HoverOnScroll

ReactDOM.render(  <Main />, document.getElementById('root'));