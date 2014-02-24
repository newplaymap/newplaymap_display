<?php
echo 'Logging an error';
   error_log(__LINE__.__FILE__.__NAMESPACE__, 0);
?>
