 /**
 * Created by 鱼慢慢慢 on 2017/11/18 0018.
 */
var experimentChart = function(theme,exper,expTime){
     require.config({
         paths: {
             echarts: 'dist',
         }
     });
     if(!exper)
         this.defaultExp = "one"+" "+0;
     else if(!expTime){
         this.defaultExp = exper+" "+0;
     }else {
         var tt = expTime-1;
         this.defaultExp = exper+" "+tt;
     }
    if(theme) this.defaultTheme = theme;
    else this.defaultTheme = 'gray';
    this.curTheme ={};
    this.option={
        title:{
            show:true,
            itemGap:4,
            textStyle:{
                fontSize: 18,
                fontWeight: 'bolder',
                color: '#333'
            },
            subtextStyle:{
                color: '#333'
            }
        },toolbox: {
            show : true,
            x:'center',
            y:'bottom',
            feature : {
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            show:true,
        },
        calculable : true,
        xAxis : [
            {
                show:true,
                type : 'category',
                boundaryGap : false,
                nameLocation:"end",
                nameTextStyle:{
                    color:"black"
                }
            }
        ],
        yAxis : [
            {
                show:true,
                scale:false,
                type : 'value',
                nameLocation:"end",
                nameTextStyle:{
                    color:"black"
                }

            },
        ],
    };
    this.result={};
 }
 experimentChart.prototype.symbolType=['circle','rectangle','triangle','diamond','emptyCircle','emptyRectangle','emptyTriangle',
     'emptyDiamond','heart','droplet','pin','arrow','star','star6','star7','star8','star9'];
 experimentChart.prototype.registerExperiment=function(experimentTime,obj){
     try {
         if(!this.checkData(obj)) {
             throw new Error("[Data Type Error] 以上结果是 ："+experimentTime);
             return;
         }
     }catch(e){
        console.log(e);
     }
    if(this.result&&this.result[experimentTime]&&Array.isArray(this.result[experimentTime])){
        this.result[experimentTime].push(obj);
    }else{
        if(!this.result) this.result={};
        this.result[experimentTime]=[];
        this.result[experimentTime].push(obj);
    }
 }
 experimentChart.prototype.checkData=function(obj){
     try {
         var str = Object.prototype.toString.call(obj);
         if(str!="[object Object]") {
             throw new Error("[Data Type Error]数据格式不对");
             return false;
         }
         if(!obj.title||!obj.subTitle||!obj.legendData||!obj.xTitle||!obj.yTitle||!obj.XData
             ||!obj.seriers||!obj.min||!obj.max){
             throw new Error("[Data Type Error]数据缺失");
             return false;
         }
         if(obj.min>=obj.max){
             throw new Error("[Data Type Error]min与max数据错误");
             return false;
         }
         if(Array.isArray(obj.XData)&&Array.isArray(obj.legendData)&&Array.isArray(obj.seriers)){
             if(obj.legendData.length==obj.seriers.length){
                 for(var i=0;i<obj.seriers.length;i++){
                     if(!Array.isArray(obj.seriers[i])){
                         throw new Error("[Data Type Error] seriers "+i+"实验结果数据格式错误。");
                         return false;
                     }
                     else{
                         if(obj.seriers[i].length!=obj.XData.length){
                             throw new Error("[Data Type Error] seriers "+i+"和 XData 长度不符"+"实验结果数据格式错误。");
                             return false;
                         }
                     }
                 }
                 return true;
             }
         }
         else{
             throw new Error("[Data Type Error]实验结果数据格式错误。");
             return false;
         }
     }catch (e){
         console.log(e);
     };

 };
 experimentChart.prototype.init = function (id,theme,exp) {
     var ctheme;
     var cexp;
     if(!theme) {
         ctheme = this.defaultTheme;
         cexp = this.defaultExp;
     }else if(!exp){
         cexp = this.defaultExp;
         ctheme = theme;
     }else{
         ctheme = theme;
         cexp = exp;
     }
     var that = this;
     require(
         [
             'echarts',
             'echarts/chart/bar' ,// 使用柱状图就加载bar模块，按需加载
             'echarts/chart/line'

         ],
         function (ec) {
             // 基于准备好的dom，初始化echarts图表
             that.echarts = ec;
             that.myChart = ec.init(document.getElementById(id));
             that.initSelectList();
             that.setExp(cexp);
             that.setThem(ctheme);
         }
     );
 }
 experimentChart.prototype.initSelectList = function(){
    var themDiv = $('<div></div>');
    var themeSelector = $('<select></select>');
     themeSelector.html(
         '<option selected="true" name="gray">gray</option>'
         + '<option name="infographic">infographic</option>'
         + '<option name="shine">shine</option>'
         + '<option name="dark">dark</option>'
         + '<option name="blue">blue</option>'
         + '<option name="green">green</option>'
         + '<option name="red">red</option>'
         + '<option name="macarons">macarons</option>'
         + '<option name="helianthus">helianthus</option>'
         + '<option name="roma">roma</option>'
         + '<option name="mint">mint</option>'
         + '<option name="macarons2">macarons2</option>'
         + '<option name="sakura">sakura</option>'
         + '<option name="default">default</option>'
     );
    var themeSpan = $('<span>更换主题</span>');
    var themeRefresh = $('<button>刷新主题</button>');
    themDiv.append(themeSelector);
    themDiv.append(themeSpan);
    themDiv.append(themeRefresh);
    $(document.body).append(themDiv);
    $(document.body).append('<br></br>');
    $(document.body).append('<hr></hr>');
     $(document.body).append('<br></br>');
    this.themeSelector = themeSelector;
    var that = this;
    $(this.themeSelector).on('change', function(){
     that.setThem($(this).val());
    });
     themeRefresh.on('click',function () {
         that.refresh();
     })
    var expDiv = $('<div></div>');
    var expSelector = $('<select></select>');
    var expArr = Object.keys(this.result);
    for(var i =0;i<expArr.length;i++){
        var expName = expArr[i];
        if(!Array.isArray(this.result[expName])) continue;
        for(var j=0;j<this.result[expName].length;j++){
            var tt = j+1;
            var val = expName+" "+j;
            var text ="第"+expName+"组试验  ，"+"试验 "+tt;
            expSelector.append("<option value='"+val+"'>"+text+"</option>");
        }
    }
    expDiv.append(expSelector);
     var expSpan = $('<span>更换试验</span>');
     var expBtn = $('<button>刷新试验</button>');
     expDiv.append(expSpan);
     expDiv.append(expBtn);
     $(document.body).append(expDiv);

     this.expSelector = expSelector;
     $(this.expSelector).on('change',function () {
         that.setExp($(this).val());
     })
     $(expBtn).on('click',function () {
         that.refresh();
     })

 }
 experimentChart.prototype.setExp=function (exp) {
     this.expSelector.val(exp);
     this.myChart = this.echarts.init(document.getElementById('main'), this.curTheme);
     this.myChart.showLoading();
    var arr = exp.split(' ');
    if(!arr||arr.length!=2||!exp){
        arr[0] ='one';
        arr[1]=0;
    }
    var expName = arr[0];
    var expTime = arr[1];
    var expObj = this.result[expName][expTime];
    this.setOption(expObj);
    this.myChart.setOption(this.option);
    this.myChart.hideLoading();
    console.log(this.option)
 }
 experimentChart.prototype.setOption = function (newObj) {
     if(newObj.titleShow!=undefined){
         this.option.title.show = newObj.titleShow;
     }else{
         this.option.title.show = true;
     }
     this.option.title.text=newObj.title||"";
     this.option.subTitle=newObj.subTitle||"";
     this.option.legend.data=newObj.legendData;
     this.option.xAxis[0].data= newObj.XData;
     this.option.xAxis[0].name = newObj.xTitle;
     this.option.yAxis[0].name=newObj.yTitle;
     this.option.yAxis[0].min= newObj.min;
     this.option.yAxis[0].max= newObj.max;
     var num = newObj.seriers.length;
     var series=[];
     for(var i=0;i<num;i++){
         var ser ={};
         ser.name=newObj.legendData[i];
         ser.type = 'line';
         ser.data=newObj.seriers[i];
         ser.symbol=this.symbolType[i];
         ser.symbolSize=4;
         series.push(ser);
     }
     series[0].stack='总量';
     this.option.series = series;
 }
 experimentChart.prototype.setThem = function (theme) {
     this.myChart.showLoading();
     $(this.themeSelector).val(theme);
     var that = this;
     if (theme != 'default') {
         require(['theme/' + theme], function(tarTheme){
             that.curTheme = tarTheme;
             setTimeout(that.refreshTheme.bind(that), 500);
         })
     }
     else {
         that.curTheme = {};
         setTimeout(that.refreshTheme.bind(that), 500);
     }
 }
 experimentChart.prototype.refreshTheme = function () {
     this.myChart.hideLoading();
     this.myChart.setTheme(this.curTheme);
 }
 experimentChart.prototype.refresh = function () {
     this.myChart.showLoading();
     this.myChart.setOption(this.option);
     this.refreshTheme();

     this.myChart.hideLoading();
 }
