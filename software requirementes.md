# software requirementes 

## Payments 
[] they should not be able to modify after the gross income invoice is settled 

## Gross income 
[] they should not be able to modify after the gross income invoice is settle 

  ### Technical requirements
  [] when update, update the paidAt property of gross income invoice 

  ### security
  [] only collectors can create, update and edit gross incomes

## Gross income invoice 
[] it should not be able to modify after is settled 
  [] should not be able to remove payments after it is settled
  [] 

[] it should be settle only if the total of payments is equal to the total of gross incomes + form price 

[] it should be settle only if the payments are verified

[] set a TCMMVBCV update date so you can keep track of when the tax was set 

[] only Liquidator can settle invoices 
[] invoice can be settled, only if the payments are checked 

  ### security
  [] only collectors can create, update and edit gross income invoices 

  ### Technical requirements 
  [] when update, update paidAt property 


[] paidAt of payment status should update after
  [] editing payments
  [] editing invoice 
  [] editing gross incomes
  

[] when adding payments
  [] should show only the payments of the business and the people associated

## User managment 

[] when there is no admin, the program should allow to singup an admin 

[] only admins can create, edit and delete users 

[] 


## Bank Accounts 
[] only directors should be able to create, update and delete bank accounts

## Business
[] only directors, collectors and fiscales can create and update

## Branch Offices 
[] only directors, collectors and fiscales can create and update branch offices 