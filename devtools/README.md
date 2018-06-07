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
    disable: 可选项。如果为true，switch会被禁用, 默认switch可用
```
