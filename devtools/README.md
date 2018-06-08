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