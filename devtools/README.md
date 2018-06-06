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
            display-label="{id: 'check_1', name: 'aaa'}">
</mdl-checkbox>
```
Options
```
    display-label:必选项。name显示checkbox的label，id为了区分页面不同checkbox的label for属性
    ng-model：必选项。checkbox绑定值，true or false对应checkbox的 选中/未选
    disable: 可选项。如果为true，switch会被禁用, 默认switch可用
```

