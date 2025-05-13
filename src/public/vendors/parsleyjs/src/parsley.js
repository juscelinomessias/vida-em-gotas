import $ from 'jquery';
import Parsley from './parsley/main';
import './parsley/pubsub';
import './parsley/remote';
import './i18n/pt-br';
import inputevent from './vendor/inputevent';

inputevent.install();

export default Parsley;
