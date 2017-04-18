// store.js

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// the root, initial state object
const state = {
	notes: [],
	activeNote: {}
};

// define the possible mutations that can be applied to our state
const mutations = {
	// 添加笔记
	ADD_NOTE(state){
		const newNote = {
			/* text: 默认文字内容 favorite: 收藏*/
			text: 'new Note',
			favorite: false
		}
		state.notes.push(newNote);
		state.activeNote = newNote;
	},
	// 编辑笔记
	EDIT_NOTE(state, text){
		state.activeNote.text = text;
	},
	// 设置当前激活的笔记
	SET_ACTIVE_NOTE(state, note){
		state.activeNote = note
	},
	// 切换笔记的收藏与取消收藏
	TOGGLE_FAVORITE(state){
		state.activeNote.favorite = !state.activeNote.favorite;
	},
	// 删除笔记
	DELETE_NOTE(state){
		state.notes.$remove(state.activeNote);
		state.activeNote = state.notes[0];
	}
};

// create the Vuex instance by combining the state and mutations objects
// then export the Vuex store for use by our components
export default new Vuex.Store({
	state,
	mutations
});
