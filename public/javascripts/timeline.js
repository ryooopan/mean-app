$(document).ready(function(){
  $uid = $("#uid").val();
  $fork_uid = $("#fork_uid").val();
  $save_timeline = true;
  $auto_help_shown = {};
  $pc = 0;
  $description_updated = false;
  $declined_count = 0;
  
  $("#wt_title").keyup(function(){
    var $title = $(this).val();
    if($title.length > 30)
    {
      $title = $title.substr(0, 30) + "..."
    }
    else if($title.length == 0)
    {
      $title = "Untitled Walkthrough";
    }
    $("#wt_name").html($title)
  });
  
  $("#wt_name").click(function(){
    if($("#wt_info_modal").hasClass("removed"))
    {
      $("#wt_info_modal").animate({right:'60%', left:'0%'}, 'slow').removeClass("removed");
    }
    else
    {
      $("#wt_info_modal").animate({right:'100%', left:'-40%'}, 'slow').addClass("removed");
    }
    return false;
  });
  
  var timer;
  $(".author_wt").hover(function(){
    if(timer) {
      clearTimeout(timer);
      timer = null
    }
    timer = setTimeout(
      function() 
      {	
	$(".author_wt_expanded").show("fast");
      }, 250)
  }, function(){
    clearTimeout(timer);
    timer = null;
    $(".author_wt_expanded").hide("fast");
  });
  
  
  //var descr = $.trim(tinyMCE.activeEditor.getContent());
  $("#twitter, #title, #description").keyup(function(){
    set_description_updated();
  });
});

var $postdata = [];
var $send_postdata = "";
var $send_postdata_array = $postdata;
var $processing = false;
var $future_submit;
var $buffer_size = 20;
var $coding_started = false;
function save_change($editor, $old_content, $new_content, $ncp, $ocp, $selected)
{
  $coding_started = true;
  $('#record .fa').addClass('fa-spin');
  $('#record .text').text('Recording ...');
  $("#player_breadcrumb .breadcrumb_play").html("Saving");
  clearTimeout($future_submit);
  //console.log($editor+", "+$old_content+", "+$new_content+", "+$ncp+", "+$ocp+", "+$selected);
  
  $(".save_bulb").addClass("yellow").html("Buffering...");
  
  if($("#player_breadcrumb .breadcrumb_play").hasClass("inactive"))
  {
    $("#player_breadcrumb .breadcrumb_play").removeClass("inactive");
  }
  
  if($description_updated)
  {
    save_description_update();
  }
  
  $microtime = microtime(true);
  
  var $added = ""; var $removed = "";
  if($old_content != $new_content)
  {
    $array = calculate_added_removed($old_content, $new_content);
    $added = encodeURIComponent($array['added']);
    $removed = encodeURIComponent($array['removed']);
    
    //console.log("OCP: " + $ocp + " NCP: " + $ncp + " = " + Math.abs($ncp - $ocp));
    //if(Math.abs($ncp - $ocp) <= 1 && $array['rocp'] - $array['locp'] >= 4)
    
    //Multi line indent hack. 1+ line indents make a difference of atleast 4 between LOCP and ROCP
    if(Math.abs($ncp - $ocp) != $added.length && Math.abs($ncp - $ocp) != $removed.length && $added.length != $removed.length && $added.length && $removed.length)
    {
      //console.log("indent");
      $ocp = $array['locp'];
      $ncp = $array['rocp'];
      if($added.length > $removed.length)
      {
	//console.log("al: " + $added.length + " rl" + $removed.length)
	//$ncp = $array['rocp']-1;
      }
    }
    else if($ocp != $array['locp'] && $ocp != $array['rocp'])
    {
      $ocp = $array['locp'];
    }
  }
  
  //Due to doble onchange trigger bug of Codemirrir
  if($ocp == $ncp && $added == "" && $removed == "") return false;
  
  //console.log("added: " + $array['added'] + " removed: " + $array['removed']);
  
  //console.log($ncp);
  //var $new_line = $ncp['line'];
  //var $new_ch = $ncp['ch'];
  //var $cp = $new_line + "," + $new_ch;
  //console.log($cp);
  
  $new_content = encodeURIComponent($new_content);
  //console.log("'" + $removed +"' replaced with '"+ $added +"'. Caret position: " + $ncp);
  
  //Get scroll positions of current editor
  $scroll_top = $(".CodeMirror-scroll", "#"+$editor).scrollTop();
  $scroll_left = $(".CodeMirror-scroll", "#"+$editor).scrollLeft();
  
  if($postdata.length == 0) $pc = 0;
  //$postdata.push("&editor["+$pc+"]=" + $editor + "&removed["+$pc+"]=" + $removed + "&added["+$pc+"]=" + $added + "&ncp["+$pc+"]=" + $ncp + "&ocp["+$pc+"]=" + $ocp + "&scroll_left["+$pc+"]=" + $scroll_left + "&scroll_top["+$pc+"]=" + $scroll_top + "&new_content["+$pc+"]=" + $new_content + "&microtime["+$pc+"]=" + $microtime + "&selected["+$pc+"]=" + $selected);
  $postdata.push("editor[]=" + $editor + "&removed[]=" + $removed + "&added[]=" + $added + "&ncp[]=" + $ncp + "&ocp[]=" + $ocp + "&scroll_left[]=" + $scroll_left + "&scroll_top[]=" + $scroll_top + "&new_content[]=" + $new_content + "&microtime[]=" + $microtime + "&selected[]=" + $selected);
  $pc++;
  
  if($new_content && $pc > 1)
  {
    //console.log($postdata);
    for(var $i = $postdata.length-2; $i >= 0; $i--)
    {
      //console.log($i);
      //console.log($postdata[$i]);
      var $json = JSON.parse('{"' + $postdata[$i].replace(/&/g, "\",\"").replace(/=/g,"\":\"") + '"}');
      if($json['new_content[]'] && $json['editor[]'] == $editor)
      {
	//console.log("new content cleared");
	$json['new_content[]'] = "";
	$postdata[$i] = decodeURIComponent($.param($json));
      }
    }
  }
  
  //console.log($added);
  //console.log($postdata);
  
  if($postdata.length >= $buffer_size && !$processing && $postdata.length != 0)
  {
    //submit_change();
  }
  else
  {
    //$future_submit = setTimeout(submit_change, 2000); //Submit if user doesn't do anything for 2 seconds
  }
  
  return true;
}

function save_editor_drag()
{
  clearTimeout($future_submit);
  
  var $microtime = microtime(true);
  
  var $offset = $(".editor_pane").offset();
  var $me_top = $offset.top;
  var $me_left = $offset.left;
  
  $postdata.push("me_top["+$pc+"]=" + $me_top + "&me_left["+$pc+"]=" + $me_left + "&microtime["+$pc+"]=" + $microtime);
  $pc++;
  $future_submit = setTimeout(submit_change, 2000); //Submit if user doesn't do anything for 2 seconds
}

function save_resolution_change()
{
  console.log("hello");
  clearTimeout($future_submit);
  
  var $microtime = microtime(true);
  
  var $outputw = $("#docCanvas").width();
  var $outputh = $("#docCanvas").height();
  
  $postdata.push("outputw["+$pc+"]=" + $outputw + "&outputh["+$pc+"]=" + $outputh + "&microtime["+$pc+"]=" + $microtime);
  $pc++;
  $future_submit = setTimeout(submit_change, 2000); //Submit if user doesn't do anything for 2 seconds
}

function submit_change()
{
  console.log("submit_change");
  clearTimeout($future_submit);
  if($processing == true)
    return false;
  
  $processing = true; 
  
  $send_postdata_array = $postdata.slice(0); // JS passes values by reference, hence slice is used to copy the array. else if a user types something more before the buffer could be saved, it would alter send_postdata_array creating to issues while clearing buffer.
  if($send_postdata_array.length > 0)
  {
    $send_postdata = $send_postdata_array.join("&");
    $send_postdata += "&action=save";

    if( $("#uid").get(0) )
    {
      var $timeline_data = "&id="+$('#uid').data("id")+"&title="+$('#title').val()//+"&fork_uid="+$('#fork_uid').val()+"&description="+$.trim(tinyMCE.activeEditor.getContent())+"&twitter="+$('#twitter').val();
      $send_postdata += $timeline_data;
    }

    $.ajax({
      type: "POST",
      url: "/save/index",
      data: $send_postdata,
      timeout: 30000, 
      success: function(data){
	//console.log("Posted("+$send_postdata_array.length+"): " + $send_postdata);
	if(data == "success")
	{
	  $("#player_breadcrumb .breadcrumb_play").html("Play");
	  if($("#player_breadcrumb .breadcrumb_play").hasClass("inactive"))
	  {
	    $("#player_breadcrumb .breadcrumb_play").removeClass("inactive");
	  }
	  //console.log($send_postdata_array);
	  //console.log(microtime(true) + " - Buffer saved successfully - removing " + $send_postdata_array.length + " items");
	  $postdata.splice(0, $send_postdata_array.length);
	  //console.log(microtime(true) + " - Length after splice: " + $postdata.length)
	}
	else
	{
	  //console.log(microtime(true) + " - Some error in saving data, data is temporarily saved back in JS buffer");
	  /* hoge
	  $future_submit = setTimeout(submit_change, 2000); //Submit if user doesn't do anything for 2 seconds
	  */
	}
	// hoge
	$postdata.splice(0, $send_postdata_array.length);
	$processing = false;
	data = "";
	//alert('Saved ! :D');
	$.gritter.add({
          title: "Saved Successfully",
          text: "Let's begin choose your code",
          time: 1800
	});
      }, 
      error: function(){
	$processing = false;
	$future_submit = setTimeout(submit_change, 2000); //Submit if user doesn't do anything for 2 seconds
	$declined_count++;
	if($declined_count > 5)
	{
	  //$(".save_bulb").addClass("red").html("Error! Server declined for the "+$declined_count+" time.");
	  //alert("Your code is not getting saved. This can occur either because you're not connected to the Internet or because our servers are temporarily having problems.")
	  console.log('error');
	}
      }
    });
  }
  else
  {
    $processing = false; 
  }
}

window.onbeforeunload = function (e) {
  if($postdata.length > 0)
  {
    submit_change();
    var message = "Some of the code you wrote is not yet saved.",
    e = e || window.event;
    // For IE and Firefox
    if (e) { e.returnValue = message; }

    // For Safari
    return message;
  }
};

$(".breadcrumb_play").hover(function(){
  if($postdata.length > 0)
  {
    submit_change();
  }
});

function calculate_added_removed($old_content, $new_content)
{
  //console.log("NC: " + $new_content + "OC: " + $old_content);
  var $oa = $old_content.split("");
  var $na = $new_content.split("");
  var $oap = $oa;
  var $nap = $na;
  var $ocp = false;
  var $ncp = 0;
  
  var $locp = $oa.length-1;
  var $rocp = 0;
  
  //console.log($na.length);
  for($i = 0; $i < $na.length; $i++)
  {
    if($na[$i] == $oa[$i])
    {
      //console.log($nap[$i]);
      $nap.splice($i, 1, "");
      $oap.splice($i, 1, "");
    }
    else
    {
      $locp = $i;
      break;
    }
  }
  if($ocp === false) $ocp = $oa.length;
  //console.log($old_content + "->" + $new_content + " = " + $nap.join(""));
  
  $na.reverse();
  $oa.reverse();
  for($i = 0; $i < $na.length; $i++)
  {
    if($na[$i] == $oa[$i])
    {
      $nap.splice($i, 1, "");
      $oap.splice($i, 1, "");
    }
    else
    {
      //console.log($na[$i]+" != "+$oa[$i]);
      $rocp = $new_content.length - $i;
      break;
    }
  }
  $na.reverse();
  $oa.reverse();
  
  $added = $nap.join("");
  $removed = $oap.join("");
  //console.log("Added("+$added.length+"): " + $added + "\n" + "Removed("+$removed.length+"): " + $removed);
  //console.log("SL: " + $na.length + " locp: " + $locp + ", " + "rocp: " + $rocp);
  
  $array = {};
  $array['added'] = $added; $array['removed'] = $removed; $array['locp'] = $locp; $array['rocp'] = $rocp;
  
  return $array;
}

function microtime(get_as_float)
{
  var unixtime_ms = new Date().getTime();
  var sec = parseInt(unixtime_ms / 1000);
  
  return get_as_float ? (unixtime_ms/1000) : (unixtime_ms - (sec * 1000))/1000 + ' ' + sec;
}

function set_description_updated()
{
  if(!$coding_started) $description_updated = true;
  else save_description_update();
}

function save_description_update()
{
  //save timeline details if user updated description form
  var timeline_data = {
    uid: $('#uid').val(), 
    title: $('#title').val(), 
    description: $.trim(tinyMCE.activeEditor.getContent()), 
    twitter: $('#twitter').val(), 
    fork_uid: $('#fork_uid').val(), 
  }
  $.post("save/create_timeline", timeline_data, function(data){
    if(data == "error")
    {
      
    }
    else
    {
      //console.log("description saved to DB");
      $description_updated = false;
    }
  });
}
