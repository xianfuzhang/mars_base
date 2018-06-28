# MDC 组件使用帮助文档

## mdl-switch
```
<mdl-switch ng-model="dashModel.switch" 
            disable="true"
            display-label="{on: '开', off: '关', id: 'aaa'}">
</mdl-switch>
```
Options
```
    ng-model：必选项。switch绑定值，true or false对应switch的 on/off
    disable: 可选项。如果为true，switch会被禁用, 默认switch可用
    display-label: 可选性。如果没有提供，默认显示off/on。如果页面存在多个switch，需要提供id区分，否则点击label无效
```

## mdl-checkbox
```
<mdl-checkbox ng-model="dashModel.switch" 
            disable="true"
            display-label="{id: 'check_1', label: 'aaa'}">
</mdl-checkbox>
```
Options
```
    display-label:必选项。label显示checkbox的label，id为了区分页面不同checkbox的label for属性
    ng-model：必选项。checkbox绑定值，true or false对应checkbox的 选中/未选
    disable: 可选项。如果为true，switch会被禁用, 默认switch可用
```

## mdl-radio
```
<mdl-radio ng-model="dashModel.radio" 
            disable="true"
            display-label="{id: 'check_1', label: 'aaa', name: 'radio_1', value:  0}">
</mdl-radio>
```
当Create/Edit页面时，ng-model需要有个初始值，然后比较display-label的value决定是否checked

Options
```
    display-label:必选项。label显示checkbox的label，id为了区分页面不同checkbox的label for属性
                        name表示radio组名
    ng-model：必选项。radio组绑定，值为radio 被checked value
    disable: 可选项。如果为true，switch会被禁用, 默认可用
```

## mdl-text
```
<mdl-text ng-model="dashModel.text" 
            disable="true"
            display-label="{id: 'text1', hint: 'name', type: 'text', required: false}"
            helper="{id: 'help1', persistent: true, validation: false, content: 'i am a helper.'}">
</mdl-text>
```
DEMO: 
https://material-components.github.io/material-components-web-catalog/#/component/text-field

支持class: https://github.com/material-components/material-components-web/tree/master/packages/mdc-textfield

Options
```
    display-label:必选项。id为了区分页面不同text的label for属性
                         type支持的input类型，支持text，number， password; 默认text
                         hint表示提示内容
                         required为true表示必填项,默认为false
    ng-model：必选项。text绑定value
    helper: 可选项。 id表示helper唯一标识
                    content表示helper显示的内容
                    persistent：一直显示content。默认为false不显示
                    validation：为true时验证失败显示content，修改后验证成功把状态改为false就不会显示；默认为false不显示
    disable: 可选项。如果为true，text会被禁用, 默认可用。
```

## mdl-textarea
```
<mdl-textarea ng-model="dashModel.textarea" 
            disable="false"
            display-label="{hint: 'description', resize: false}">
</mdl-textarea>
```
Options
```
    ng-model：必选项。textarea绑定value
    display-label:可选项。hint表示提示内容
                        resize 为true表示可调整大小，默认为false不可调整
                        rows:可指定textarea可见行数，默认不指定
                        cols:可指定textarea可见宽度，默认不指定
    disable: 可选项。如果为true，select会被禁用, 默认可用。
```

## mdl-select
```
<mdl-select ng-model="dashModel.select" 
            disable="false"
            display-label="{hint: 'name', options: [{label: '男1', value: '0'}, {label: '男2', value: '1'}]}"
            helper="{content: 'i am a helper.'}">
</mdl-select>
```
Options
```
    display-label:必选项。hint表示提示内容
                        options 显示select的内容
    ng-model：必选项。select绑定option对象
    helper: 可选项。 content表示helper显示的内容
    disable: 可选项。如果为true，select会被禁用, 默认可用。
```

## dialog
```
this.di.$uibModal.open({
          template: require('../../../components/mdc/templates/dialog.html'),
          controller: 'dialogCtrl',
          backdrop: true,
          resolve: {
            dataModel: () => {
              return {
                type: 'warning',
                headerText: 'header',
                contentText: 'content',
                cancelText: 'cancel',
                confirmationText: 'yes'
              };
            }
          }
        })
        .result.then((data) => {
          if(data) {
            console.log('data handle');
          }
      });
```
在controller中点击button实现以上代码，contoller需要注入'$uibModal'依赖。

Options
```
    headerText: 必选项。弹出框的标题
    contentText： 必选项。弹出框的内容
    type: 可选项。默认warning，有cancel，confirm两个确定按钮；当值为notification时只有一个confirm按钮
    confirmationText: 可选项。 默认值为"确定"
    cancelText: 可选项。 默认值为"取消"
```
### elevation
设置块的阴影，仅限于css样式。适用于mdc组件和自定义组件。

css使用说明：https://github.com/material-components/material-components-web/tree/master/packages/mdc-elevation
```
mdc-elevation--z<N>: 设置elevation的(N)dp, 1<= N <= 24;例如 mdc-elevation--z4

```

### floating action button
FAB代表应用当前主要操作按钮。使用前需要在index.html中引入google icon。

css使用说明：https://github.com/material-components/material-components-web/tree/master/packages/mdc-fab
```
<head>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>

<button class="mdc-fab" aria-label="Favorite">
  <span class="mdc-fab__icon material-icons">favorite</span>
</button>
```

##mars组件说明
### `wizard组件`
```
<wizard title="title" steps="steps" show-wizard="false|true" before-cancel="cancel(formData)" before-submit="submit(formData)"></wizard>
```
**``title:``** 设置`wizard`对话框的标题

**``steps:``** 设置wizard步骤的内容  
例子：
```
$scope.steps = [
  {
    id: 'first',
    title: 'first step',
    content: require('../template/form1.html')
  },
  {
    id: 'second',
    title: 'second step',
    content: require('../template/form2.html')
  },
  {
    id: 'third',
    title: 'third step',
    content: require('../template/form3.html')
  },
];
```
**``id:``**步骤id；**``title``**步骤标题；**``content``** 步骤内容，使用``require``引入文件内容。

**``show-wizard:``** 控制``wizard``对话框的展示和隐藏

**``before-cancel:``** 点击``wizard``对话框中**``取消``**按钮，会先调用这个方法，并将表单内容传递给此方法。当此方法返回**``true``**时，``wizard``对话框才会关闭，否则不会关闭。**``注意：``**``cancel(formData)``参数名``formData``不能修改。  

**``before-submit:``** 点击``wizard``对话框中**``确定``**按钮，会先调用这个方法，并将表单内容传递给此方法。当此方法返回**``true``**时，``wizard``对话框才会关闭，否则不会关闭。**``注意：``**``submit(formData)``参数名``formData``不能修改。  