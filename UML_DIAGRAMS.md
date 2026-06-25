# UML Diagrams - Digital LASU E-Commerce System

## 1. Use Case Diagram

```
actor Customer as cust
actor Vendor as vend
actor Admin as adm
actor System as sys

rectangle "Digital LASU E-Commerce" {
  usecase "Browse Products" as browse
  usecase "Search Products" as search
  usecase "View Product Details" as details
  usecase "Add to Cart" as addcart
  usecase "Checkout" as checkout
  usecase "Make Payment" as payment
  usecase "Track Order" as track
  usecase "Write Review" as review
  usecase "Message Vendor" as message
  usecase "Manage Account" as account
  
  usecase "Create Product" as createprod
  usecase "Manage Inventory" as inventory
  usecase "Process Orders" as processorder
  usecase "View Analytics" as analytics
  usecase "Manage Reviews" as managerev
  usecase "Respond to Messages" as respond
  
  usecase "Manage Users" as manageusers
  usecase "Approve Products" as approve
  usecase "Handle Disputes" as disputes
  usecase "View Reports" as reports
  usecase "Configure Settings" as settings
  
  usecase "Process Payment" as processpay
  usecase "Send Notification" as notify
  usecase "Generate Report" as genreport
}

cust --> browse
cust --> search
cust --> details
cust --> addcart
cust --> checkout
cust --> payment
cust --> track
cust --> review
cust --> message
cust --> account

vend --> createprod
vend --> inventory
vend --> processorder
vend --> analytics
vend --> managerev
vend --> respond

adm --> manageusers
adm --> approve
adm --> disputes
adm --> reports
adm --> settings

sys --> processpay
sys --> notify
sys --> genreport

payment -.-> processpay
notify -.-> payment
notify -.-> track
