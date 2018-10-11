<?php

Class apiResult {
	var $error = true;
	var $msg = '';
	var $action = null;
	var $page = null;
	var $fields = null;
    
	function set($field, $args) {
        $this->{$field} = $args;
    }
}

Class apiBC {
	var $action = null;
	var $page = null;
	var $pageFile = null;
	var $fields = null;
	var $msg = null;
	
	function __construct($args=array()) {
		$this->fields = dataPage();
		$this->action = actionDetect();
		$this->page = pageActive();
		$this->pageFile = pageFile();
		
		if(isset($this->fields->page)){
			unset($this->fields->pageFile);
			unset($this->fields->page);
			unset($this->fields->action);
		}
	}
}
