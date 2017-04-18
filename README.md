# vue
在本教程中，我们将学习如何通过构建笔记应用程序在VueJs项目中使用Vuex。 我们将简要介绍一下Vuex，何时使用它，以及如何构建您的项目以用于Vuex应用程序。 然后，我们将这些概念应用于我们正在构建的笔记应用程序，一步一步。

以下是我们将要开发的笔记应用程序的屏幕截图：

VueJs Notes应用程序与Vuex

您可以从GitHub Repo下载完成的代码。 另外请务必查看演示 ，了解本教程将要构建的内容。
Vuex概述

在我们立即开始构建笔记应用程序之前，我想花几分钟时间了解Vuex的一些核心概念。 （我会尽量避开所有的花哨的嗡嗡声，但是当我使用任何东西时，我一定会解释一下）

Vuex是一个强制执行Flux类应用程序体系结构的库，用于帮助您构建中等到大规模的SPA（单页面应用程序）。 它为您提供了一种构建这些应用程序并以可维护和易于理解的方式来管理其状态的方法。

第一次听到这个字状态可能看起来很模糊，所以简单来说，将状态视为您在Vue应用中使用的数据。 但是，Vuex区分组件本地状态和应用程序级别状态 ：

    组件本地状态 ：仅由一个组件使用的状态（考虑您传递给Vue组件的data选项）
    应用程序级别状态 ：由多个组件使用的状态 

所以要把它放在上下文中：说你有一个父组件，这个父有两个子组件。 父母可以使用道具轻松地向子组件发送数据，因此我们已经有了这个沟通渠道。

现在，如果两个兄弟姐妹想要相互通信，因为他们都需要相同的数据。 或者当一个孩子需要传递数据到它的父母？ 当您的应用程序很小时，这不应太难，因为您可以使用共享事件发送器在父母和子级之间进行通信。

但是，随着您的应用程序的发展：

    跟踪所有这些事件变得困难。 哪个组件触发事件？ 谁在听？
    业务逻辑分散在许多不同的组件上，而不是集中式，导致意外的副作用
    父母由于必须明确派遣和倾听某些事件，才能更加紧密地耦合到孩子身上 

这些是Vuex解决的一些问题。 Vuex系统背后的4个核心概念是：

    状态树 ：包含所有应用程序级别状态的对象
    Getters ：从我们的Vue组件中使用存储中的访问数据
    变异器 ：处理状态的事件处理程序
    操作 ：由Vue组件调用的功能来调度突变 

如果你不完全明白这4个术语的含义，别担心！ 当我们构建我们的应用程序时，我们将详细介绍它们。

下图显示了在Vuex应用程序（从Vuex文档）中数据流的方式：

Vuex数据流

关于这个图的一些重要的事情：

    数据流是单向的
    组件可以调用操作
    动作用于调度突变
    只有突变才能使状态发生突变（成分不能/不应该直接突变状态）
    商店是无效的 - 每当状态更新时，组件将反映这些更改 

设置项目

现在我们已经涵盖了一些基本的Vuex概念，让我们设计一下这样的项目目录结构：

Vuex项目结构

    组件/将包含我们将在后面部分中构建的VueJs组件
    vuex /包含与我们的Vuex存储相关的文件（state object，actions，mutators）
    build.js是Webpack的输出包
    index.html是我们将包括我们的根Vue组件和Webpack包的页面
    main.js是包含根Vue实例的应用程序的入口点
    styles.css有一些基本的CSS给我们的应用程序一些生活
    webpack.config.js包含我们将在一分钟内解析的Webpack配置 

继续创建一个空目录， cd进入它，并初始化一个package.json ：

 
mkdir vuex- notes - app && cd vuex- notes - app npm init - y
 

现在让我们从Webpack + vue-loader的开发依赖开始安装所有的依赖项：

 
npm install \ webpack webpack-dev-server \ vue-loader vue-html-loader css-loader vue-style-loader vue-hot-reload-api \ babel-loader babel-core babel-plugin-transform-runtime babel-preset-es2015 \ babel-runtime@ 5 \ --save-dev
 

并安装Vue和Vuex：

 
npm install vue vuex --save
 

随着所有依赖关系的安装，我们可以配置Webpack。 继续在我们的项目目录的根目录中创建webpack.config.js，它将如下所示：

 
module.exports = {  entry: './main.js' ,  output: {  path: __dirname,  filename: 'build.js' },  module: {  loaders: [ {  test: /\.js$/,  loader: 'babel' ,  exclude: /node_modules/ }, {  test: /\.vue$/,  loader: 'vue' } ] },  babel: {  presets: [ 'es2015' ],  plugins: [ 'transform-runtime' ] } }
 

让我们快速分解一些Webpack配置的含义。 我们指定要包含我们的根Vue实例的main.js的入口点。 从那里，Webpack将遍历我们所有的导入，并照顾解决我们的依赖关系。 一旦项目捆绑，Webpack将把捆绑的代码分发到我们在上面目录结构中看到的build.js文件。 这基本上都是输出选项。

现在到通常的加载程序，它只是告诉Webpack遇到特定类型的文件时该怎么办。 在我们的例子中，我们要运行2个装载器：用于处理.vue文件的vue-loader和babel-loader将我们编写的ES2015代码转换成浏览器所理解的ES5代码。

最后，我们配置babel使用我们之前安装的es2015-preset ，因为我们将在ES2015中编写代码。

最后一步是编辑NPM脚本，以便我们可以使用HMR（热模块替换）运行Webpack dev服务器，并且能够捆绑和最小化生产代码。 更新package.json中的脚本对象，如下所示：

 
"scripts" : { "dev" : "webpack-dev-server --inline --hot" , "build" : "webpack -p" }
 

现在我们可以用npm run dev运行dev服务器，我们可以使用npm run build捆绑和缩小应用程序。
创建Vuex商店

在本节中，我们将深入了解我们将为我们的笔记应用程序创建的Vuex商店。 该商店就像我们应用程序状态的容器一样，所以让我们从我们商店看起来的基本框架开始吧。 在vuex /文件夹中创建一个store.js文件：

 
// store.js import Vue from 'vue' import Vuex from 'vuex' Vue.use(Vuex) // the root, initial state object const state = { notes: [], activeNote: {} } // define the possible mutations that can be applied to our state const mutations = { } // create the Vuex instance by combining the state and mutations objects // then export the Vuex store for use by our components export default new Vuex.Store({ state , mutations })
 

    始终建议（和良好的做法）初始化状态。 

我将通过上面的框架，并在我们的笔记应用程序的上下文中解释它。 这是我们组件的视觉分解（我们将在下一节中实现）：

Vuex Notes应用程序组件

    应用程序 ，根Vue组件，是外部红色框
    工具栏是左侧的绿色框，带有添加，收藏和删除按钮
    NotesList是包含用户可以选择的注释列表的紫色框。 它还允许用户在他们所有的笔记之间切换，并且只是他们已经加星标的笔记
    编辑器是右侧的黄色框，将显示所选音符的内容 

store.js中的状态对象将包含应用程序级别状态 ，如果从上一部分回想起来，它将是多个组件之间共享的任何状态。

笔记列表（ notes: [] ）保存了NotesList组件将呈现的笔记对象。 活动注释（ activeNote: {} ）将保存当前选定的笔记对象，这些多个组件将需要注意：

    工具栏组件用于对当前选定的音符进行明星和删除
    NotesList组件通过操纵CSS来突出显示列表中的选定音符
    编辑器组件显示活动的笔记内容 

转移到突变体上。 想想突变是唯一可以修改状态的方法。 我们将为我们的笔记应用程序实现的mutators是：

    在我们的笔记数组（ state.notes ）中添加一个注释
    将活动笔记（ state.activeNote ）设置为用户从笔记列表中选择的笔记
    删除活动注释
    编辑活动的音符
    在活动票据的收藏/不利之间切换 

记住，组件不能直接修改状态，它们必须调用一个调度突变的动作。 就这样说，让我们继续实施上面列出的基本变体。

变量器总是接收状态树作为第一个参数，后跟任意数量的附加参数，您希望传递给它，称为有效负载参数。

当用户想要添加新的音符时，我们要：

    创建一个新对象
    初始化其属性
    把它推到笔记数组
    将activeNote设置为我们刚刚创建的新笔记 

 
ADD_NOTE ( state ) { const newNote = { text: 'New note', favorite: false } // only mutators can mutate the state state .notes.push(newNote) state .activeNote = newNote }
 

    将大写字母变为大写，以帮助将它们与普通函数区分开来。 

编辑一个笔记将输入用户输入的文本，并将当前活动的笔记的文本更新为作为有效载荷接收的文本：

 
EDIT_NOTE ( state , text) { state .activeNote.text = text }
 

你可以看到，我们的变体者比较简单，对他们来说并不多。 取消这一点的关键在于，对于状态的任何修改必须在变异器中进行，并且通过动作调度突变。

其余的mutator是相当直接的，所以我会避免解释每一个，因为他们都遵循上述相同的基本想法。 我们的整个vuex / store.js文件应该如下所示：

 
import Vue from 'vue' import Vuex from 'vuex' Vue.use(Vuex) const state = { notes: [], activeNote: {} } const mutations = { ADD_NOTE ( state ) { const newNote = { text: 'New note', favorite: false } state .notes.push(newNote) state .activeNote = newNote }, EDIT_NOTE ( state , text) { state .activeNote.text = text }, DELETE_NOTE ( state ) { state .notes. $remove ( state .activeNote) state .activeNote = state .notes[ 0 ] }, TOGGLE_FAVORITE ( state ) { state .activeNote.favorite = ! state .activeNote.favorite }, SET_ACTIVE_NOTE ( state , note) { state .activeNote = note } } export default new Vuex.Store({ state , mutations })
 

动作只是我们的组件调用突变可以调用的函数。 他们收到商店作为第一个参数，然后是任何数量的附加参数。

例如，当用户点击工具栏组件中的添加按钮时，我们要调用一个动作来调度ADD_NOTE 。 让我们在vuex /目录中创建一个名为actions.js的文件，我们可以创建一个addNote函数来调度这个突变：

 
export const addNote = ({ dispatch }) => { dispatch( 'ADD_NOTE' ) }
 

我们使用ES2015参数解构，您可能或可能不熟悉。 或者，上述代码可以这样写：

 
export const addNote = function ( store ) { var dispatch = store.dispatch dispatch( 'ADD_NOTE' ) }
 

    我鼓励你熟悉ES2015 ，如果你还没有，因为它可以让你编写更优雅的代码，一旦你得到它的悬念 。 

addNote操作非常简单，它所做的就是调度ADD_NOTE 。 我们现在可以在任何组件文件中导入vuex / actions.js文件，并调用动作来调度突变。

你可能会想，为什么要打电话来调动一个突变？ 为什么我们不是从组件中调用突变？ 其主要原因是突变必须是同步的，而动作可以是异步的。 这基本上意味着什么：例如，如果你想要做任何AJAX请求，你必须使它们在动作中而不是突变。 Vuex文档提供了一个很好的例子：为什么突变必须是同步的，而动作可以是异步的。

其余的操作遵循相同的逻辑，整个actions.js文件将如下所示：

 
export const addNote = ({ dispatch }) => { dispatch( 'ADD_NOTE' ) } export const editNote = ({ dispatch }, e) => { dispatch( 'EDIT_NOTE' , e.target.value) } export const deleteNote = ({ dispatch }) => { dispatch( 'DELETE_NOTE' ) } export const updateActiveNote = ({ dispatch }, note) => { dispatch( 'SET_ACTIVE_NOTE' , note) } export const toggleFavorite = ({ dispatch }) => { dispatch( 'TOGGLE_FAVORITE' ) }
 

这总结了我们将需要在我们的vuex /目录中做的所有。 我们成功地设法创建了将保存我们的状态对象和变异器的store.js文件。 我们还创建了包含一些简单的函数来调度突变的actions.js。
构建Vue组件

在最后一节中，我们将实现4个组件（App，Toolbar，NotesList和Editor），并学习如何使用这些组件中的Vuex存储来检索数据并调用我们创建的操作。 作为组件故障的提醒，下面是图表：

Vuex Notes应用程序组件
创建根实例 - main.js

main.js将是我们的根Vue实例和我们的应用程序的入口点。 因此，我们将在这里导入我们的Vuex商店，并将其注入所有的孩子：

 
// main.js import Vue from 'vue' import store from './vuex/store' import App from './components/App.vue' new Vue({ store, // inject store to all children el: 'body' , components: { App } })
 

我们还会导入我们将要创建的称为App的根Vue组件。
应用程序 - 根组件

根应用程序组件将导入并组合其他3个组件：工具栏，NotesList和编辑器。 为了把它放入代码中，我们的组件/ App.vue文件将如下所示：

 
< template > < div id = "app" > < toolbar > </ toolbar > < notes-list > </ notes-list > < editor > </ editor > </ div > </ template > < script > import Toolbar from './Toolbar.vue' import NotesList from './NotesList.vue' import Editor from './Editor.vue' export default { components: { Toolbar, NotesList, Editor } } </ script >
 

我们可以将应用程序组件包含在index.html文件中，以及来自Webpack的捆绑包， Bootstrap的一些基本样式，以及可以在此处获取的我们的应用程序的styles.css：

 
<!-- index.html --> <!DOCTYPE html> < html lang = "en" > < head > < meta charset = "utf-8" > < title > Notes | coligo.io </ title > < link rel = "stylesheet" href = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" > < link rel = "stylesheet" href = "styles.css" > </ head > < body > < app > </ app > < script src = "build.js" >  </ script > </ body > </ html >
 

工具栏

工具栏组件为用户提供了3个选项：创建新笔记，收藏/取消当前所选笔记，并删除当前选定的笔记。

Vuex Notes应用程序中的工具栏组件

这是Vuex的一个很好的用例，因为工具栏组件需要知道从笔记列表中选择哪个音符，以便我们可以删除和收藏/取消选中的音符。 但是，当前选定的笔记是它自己的组件NotesList。

这是我们的状态对象中的activeNote属性派上用场。 每当用户单击列表中的一个音符时，NotesList组件将调用updateActiveNote()操作，以使用新选择的音符作为有效载荷来分派SET_ACTIVE_NOTE突变。 反过来，mutator将更新状态对象中的activeNote属性以指向所选笔记。

据说，工具栏组件需要从状态获取activeNote属性。

要从组件内部访问Vuex存储属性，我们将vuex: {}选项传递给具有getters对象的组件。 状态getter将状态作为第一个参数，并将返回值绑定到组件，以便您可以访问它，就像在组件上定义的任何data属性一样。

 
vuex: { getters: { activeNote: state => state .activeNote } }
 

我们也希望使用户，只要用户点击3个按钮中的任何一个，我们就会调用相应的操作。 为此，我们导入actions.js并在vuex.actions选项中定义它们：

 
import { addNote, deleteNote, toggleFavorite } from '../vuex/actions' export default { vuex: { getters: { activeNote: state => state .activeNote }, actions: { addNote, deleteNote, toggleFavorite } } }
 

这将会将操作绑定到组件的存储实例，并允许我们以与调用组件实例方法相同的方式调用addNote ， deleteNote和toggleFavorite方法。 将这些组合在一起我们的组件/ Toolbar.vue文件将如下所示：

 
< template > < div id = "toolbar" > < i @ click = "addNote" class = "glyphicon glyphicon-plus" > </ i > < i @ click = "toggleFavorite" class = "glyphicon glyphicon-star" :class = " {starred: activeNote.favorite} " > </ i > < i @ click = "deleteNote" class = "glyphicon glyphicon-remove" > </ i > </ div > </ template > < script > import { addNote, deleteNote, toggleFavorite } from '../vuex/actions' export default { vuex: { getters: { activeNote: state => state.activeNote } , actions: { addNote, deleteNote, toggleFavorite } } } </ script >
 

正如你所看到的，我们调用addNote()操作与我们调用组件方法的方法相同：

 
<i @click= "addNote" class = "glyphicon glyphicon-plus" > </ i >
 

对于最喜爱的按钮，我们有一些额外的逻辑。 如果所选择的音符被收录，我们要添加starred类。 这将简单地给图标一个黄色的颜色，这将作为用户的视觉提示音符是他们的最爱，如下所示：

工具栏组件中已加星标的注释
NotesList

NotesList组件有3个主要角色：

    将笔记呈现为列表
    允许用户过滤笔记以显示所有这些或只是收藏夹
    当用户从列表中选择一个便笺时，调用updateActiveNote操作来更新存储中的activeNote 

根据上述要求，我们可以看到，我们需要从商店中的notes数组和activeNote对象。

让我们继续为他们定义状态：

 
vuex: { getters: { notes: state => state .notes, activeNote: state => state .activeNote } }
 

    Vuex商店是无效的，所以每当商店更新时，组件也将相应更新。 

要在用户从列表中选择一个注释（要求3）时调用updateActiveNote操作，我们将需要导入actions.js并在vuex.actions选项中定义updateActiveNote操作：

 
import { updateActiveNote } from '../vuex/actions' export default { vuex: { getters: { notes: state => state .notes, activeNote: state => state .activeNote }, actions: { updateActiveNote } } }
 

接下来，我们创建一个计算属性，该属性将根据用户是否选择了“所有注释”或“收藏夹”，返回已过滤注释的列表：

 
import { updateActiveNote } from '../vuex/actions' export default { data () { return { show: 'all' } }, vuex: { getters: { notes: state => state.notes, activeNote: state => state.activeNote }, actions: { updateActiveNote } }, computed: { filteredNotes () { if ( this .show === 'all' ){ return this .notes } else if ( this .show === 'favorites' ) { return this .notes.filter(note => note.favorite) } } } }
 

数据选项中的show属性被称为组件本地状态，因为它仅在NotesList组件中使用。 当用户单击按钮将导致计算的属性返回适当的笔记集合时，我们将使用show属性在“全部”和“收藏夹”之间切换。

完整的NotesList.vue组件如下所示：

 
< template > < div id = "notes-list" > < div id = "list-header" > < h2 > Notes | coligo </ h2 > < div class = "btn-group btn-group-justified" role = "group" > <!-- All Notes button --> < div class = "btn-group" role = "group" > < button type = "button" class = "btn btn-default" @ click = "show = 'all'" :class = " {active: show === 'all'} " > All Notes </ button > </ div > <!-- Favorites Button --> < div class = "btn-group" role = "group" > < button type = "button" class = "btn btn-default" @ click = "show = 'favorites'" :class = " {active: show === 'favorites'} " > Favorites </ button > </ div > </ div > </ div > <!-- render notes in a list --> < div class = "container" > < div class = "list-group" > < a v-for = "note in filteredNotes" class = "list-group-item" href = "#" :class = " {active: activeNote === note} " @ click = "updateActiveNote(note)" > < h4 class = "list-group-item-heading" > {{note.text.trim().substring(0, 30)} } </ h4 > </ a > </ div > </ div > </ div > </ template > < script > import { updateActiveNote } from '../vuex/actions' export default { data () { return { show: 'all' } }, vuex: { getters: { notes: state => state.notes, activeNote: state => state.activeNote } , actions: { updateActiveNote } }, computed: { filteredNotes () { if (this.show === 'all'){ return this.notes } else if ( this .show === 'favorites' ) { return this.notes.filter(note => note.favorite) } } } } </ script >
 

有关模板的几个有趣的事情要注意：

    我们使用前30个字符作为列表中的笔记标题： note.text.trim().substring(0, 30)
    当用户单击一个音符时，该音符将传递给updateActiveNote(note)动作，以将新音符作为有效载荷发送SET_ACTIVE_NOTE
    当单击过滤器按钮时，简单的点击处理程序用于将show属性设置为“全部”或“最爱”
    我们使用:class=""绑定将Bootstrap active类添加到列表中当前选定的项目和当前选定的过滤器（'All Notes'或'Favorites'） 

编辑

编辑器组件是最简单的组件。 它只做两件事情：

    它从商店抓取当前的activeNote ，并将其显示在<textarea>
    只要用户更新笔记，它就会调用editNote()操作 

为此，我们需要在组件的vuex选项中定义一个getter和一个action：

 
import { editNote } from '../vuex/actions' export default { vuex: { getters: { activeNoteText: state => state .activeNote.text }, actions: { editNote } } }
 

我们现在可以将<textarea>的值与存储的activeNoteText ，并将editNote操作注册为editNote将在任何input事件上触发的事件处理程序：

 
< div id = "note-editor" > <textarea :value= "activeNoteText" @input= "editNote" class = "form-control" > </textarea> </ div >
 

您可能会想知道为什么我们不能仅仅使用v-model指令。 如果我们这样应用了v-model指令：

 
<textarea v-model= "activeNoteText" class = "form-control" > </ textarea >
 

那么v-model将尝试从activeNote内直接突变activeNote，这违反了调用动作来调度突变的想法，使其明确和可追踪。 另外，如果您使用严格模式 ，则会导致错误。

毕竟， v-model指令只是一个:value绑定和@input事件处理程序的语法糖。

完成的组件/ Editor.vue文件如下所示：

 
< template > < div id = "note-editor" > < textarea :value = "activeNoteText" @ input = "editNote" class = "form-control" > </ textarea > </ div > </ template > < script > import { editNote } from '../vuex/actions' export default { vuex: { getters: { activeNoteText: state => state.activeNote.text } , actions: { editNote } } } </ script >
 

包起来

这个总结了本教程！ 我希望Vuex的这个实际介绍可以帮助您将其整合到您的下一个VueJs项目中。 我想重申，Vuex面向中大规模的SPA，所以我不建议你把它放在你制作的每个应用程序中，因为它可能会比最初产生更多的复杂性。

我鼓励你下载完成的代码 ，如果你还没有，并且按照你自己的速度浏览它，看看它们是如何组合在一起的。
