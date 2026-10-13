<?php $__env->startSection('title', 'Enquiry Details'); ?>

<?php $__env->startSection('content'); ?>

<?php
    $isVisitOnly = strtolower(trim($booking->work_status ?? '')) === 'visit only';
    $visitCharge = $isVisitOnly ? ($booking->service->visiting_charge ?? 0) : 0;
    $spareTotal = $booking->bookingSpares->sum(fn ($spare) => $spare->price * $spare->qty);
    $specialDiscount = $booking->special_discount_amt ?? 0;
    $finalPrice = $isVisitOnly
        ? max(0, $visitCharge + $spareTotal - $specialDiscount)
        : max(0, $booking->grand_total_price + $spareTotal - $specialDiscount);
?>

<style>
    /* Custom Styling for Booking Nav Tabs */
    #bookingTabs {
        border-bottom: 2px solid #e2e8f0;
        gap: 6px;
    }
    #bookingTabs .nav-item {
        margin-bottom: -2px;
    }
    #bookingTabs .nav-link {
        color: #111827 !important; /* Black font for inactive tabs */
        font-weight: 600 !important;
        font-size: 13.5px;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0 !important;
        border-radius: 8px 8px 0 0 !important;
        padding: 8px 18px !important;
        transition: all 0.2s ease-in-out;
    }
    #bookingTabs .nav-link:hover {
        color: #FF6A00 !important;
        background-color: #fff7ed;
        border-color: #fdba74 !important;
    }
        #bookingTabs .nav-link.disabled,
    #bookingTabs .nav-link:disabled {
        color: #94a3b8 !important;
        background-color: #f1f5f9 !important;
        border-color: #e2e8f0 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
        opacity: 0.55 !important;
        box-shadow: none !important;
    }
    #bookingTabs .nav-link.active {
        color: #ffffff !important; /* White text on selected tab */
        background-color: #FF6A00 !important; /* Theme brand color */
        border-color: #FF6A00 #FF6A00 transparent !important;
        font-weight: 700 !important;
        box-shadow: 0 3px 6px rgba(255, 106, 0, 0.25);
    }
    .form-control.is-invalid, .form-select.is-invalid {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.2) !important;
    }
</style>
<div class="container-fluid">

    <!-- HEADER -->
    <div class="card border-0 shadow-sm rounded-3 mb-2">
        <div class="card-header bg-white border-bottom py-2 px-3">

            <div class="d-flex justify-content-between align-items-center">

                <!-- LEFT -->
                <div>
                    <h5 class="mb-0 fw-semibold">
                        #<?php echo e($booking->booking_no); ?>

                    </h5>

                    <small class="text-muted">
                        <?php echo e(formatDateTodmYHis($booking->enquiry_date_time)); ?> • <?php echo e($booking->created_at->diffForHumans()); ?>

                    </small>
                </div>

                <!-- RIGHT -->
                <div class="d-flex gap-1">
                    
                    <a href="<?php echo e(route('bookings.index')); ?>" class="btn btn-outline-secondary btn-sm">
                        <i class="fa fa-arrow-left"></i>
                    </a>
                </div>
            </div>

        </div>
    </div>

    <div class="row">

        <!-- LEFT -->
        <div class="col-lg-9">

            <div class="card">
                <div class="card-body row">
                    <div class="col-md-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0">Customer</h6>

                            <a href="<?php echo e(route('customers.edit', $booking->customer_id)); ?>"
                            class="btn btn-sm btn-outline-primary"
                            title="Edit Customer">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                        </div>
                        <?php echo e($booking->customer_name); ?><br>
                        <?php echo e($booking->mobile); ?> | <?php echo e($booking->alt_mobile); ?><br>
                        <span class="text-success fw-bold"><?php echo e(ucfirst($booking->enquiry_type)); ?></span> |
                        <span class="badge bg-info-subtle text-info border fw-bold"><?php echo e(ucfirst($booking->enquiry_source ?? $booking->platform_type ?? "web")); ?></span>
                    </div>

                    <div class="col-md-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold mb-0">Address</h6>
                            <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editAddressModal" title="Edit Address" onclick="initAddressEdit()">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                        </div>
                        <?php echo e($booking->address_line_1); ?><br>
                        <?php echo e($booking->address_line_2); ?><br>
                        <?php echo e($booking->area->name ?? ''); ?> <?php echo e($booking->city->name ?? ''); ?> <?php echo e($booking->state->name ?? ''); ?> <br>
                        <a href="https://www.google.com/maps?q=<?php echo e($booking->customerAddress?->latitude); ?>,<?php echo e($booking->customerAddress?->longitude); ?>"
                            target="_blank" style="text-decoration: none;" class="margin-right:10px;">
                            View On Map
                        </a>
                        <i class="fas fa-map-marker-alt"></i>
                    </div>

                    <div class="col-md-4">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h6 class="fw-bold mb-0">Status</h6>
                            <?php if(!in_array(strtolower($booking->status ?? ''), ['cancelled', 'completed'])): ?>
                            <div class="d-flex gap-1">
                                <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 11.5px; border-radius: 4px;" data-bs-toggle="modal" data-bs-target="#rescheduleBookingModal" title="Reschedule Booking">
                                    <i class="fa-solid fa-calendar-days me-1"></i>Reschedule
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size: 11.5px; border-radius: 4px;" data-bs-toggle="modal" data-bs-target="#cancelBookingModal" title="Cancel Booking">
                                    <i class="fa-solid fa-ban me-1"></i>Cancel
                                </button>
                            </div>
                            <?php endif; ?>
                        </div>
                        <?php
                            $statusLower = strtolower(trim($booking->status ?? 'pending'));
                            $statusBadgeClass = match($statusLower) {
                                'completed' => 'bg-success',
                                'cancelled' => 'bg-danger',
                                'rescheduled' => 'bg-info text-dark',
                                'in progress', 'in_progress' => 'bg-primary',
                                default => 'bg-warning text-dark'
                            };
                        ?>
                        <span class="badge <?php echo e($statusBadgeClass); ?>"><?php echo e(ucfirst($booking->status ?? 'Pending')); ?></span><br>
                        <small>Schedule: <?php echo e($booking->enquiry_date_time 
                            ? date('d/m/Y', strtotime($booking->enquiry_date_time))
                            : ''); ?>

                            <?php echo e($booking->slot->slot_time ?? ''); ?>

                        </small>
                    </div>
                </div>
            </div>

            <!-- NAV TABS -->
            <?php
                $hasServices = ($booking->bookingDetails && $booking->bookingDetails->count() > 0);
                $hasFollowup = ($booking->followups && $booking->followups->count() > 0);
                $hasProvider = (!empty($booking->vendor_id) || ($booking->bookingVendorAssigns && $booking->bookingVendorAssigns->count() > 0));
                $hasSpares   = ($booking->bookingSpares && $booking->bookingSpares->count() > 0);
                $hasImages   = ($booking->imageAttachements && $booking->imageAttachements->count() > 0);
                $hasWork     = ($booking->bookingWorks && $booking->bookingWorks->count() > 0);

                // Sequential enable/disable rules:
                $servicesEnabled        = true;
                $followupEnabled        = $hasServices;
                $providerEnabled        = $hasFollowup;
                $sparesEnabled          = $hasProvider;
                $imageAttachmentEnabled = $hasSpares;
                $workEnabled            = $hasImages;
                $paymentEnabled         = $hasWork;
            ?>

            <ul class="nav nav-tabs mb-3 mt-3" id="bookingTabs" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#services">
                        Services
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link <?php echo e(!$followupEnabled ? 'disabled' : ''); ?>" 
                        data-bs-toggle="tab" data-bs-target="#followup" 
                        <?php echo e(!$followupEnabled ? 'disabled tabindex=-1 aria-disabled=true' : ''); ?>>
                        Follow-up
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link <?php echo e(!$providerEnabled ? 'disabled' : ''); ?>" 
                        data-bs-toggle="tab" data-bs-target="#provider" 
                        <?php echo e(!$providerEnabled ? 'disabled tabindex=-1 aria-disabled=true' : ''); ?>>
                        Provider
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link <?php echo e(!$sparesEnabled ? 'disabled' : ''); ?>" 
                        data-bs-toggle="tab" data-bs-target="#spares" 
                        <?php echo e(!$sparesEnabled ? 'disabled tabindex=-1 aria-disabled=true' : ''); ?>>
                        Spare Parts
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link <?php echo e(!$imageAttachmentEnabled ? 'disabled' : ''); ?>" 
                        data-bs-toggle="tab" data-bs-target="#image_attachment" 
                        <?php echo e(!$imageAttachmentEnabled ? 'disabled tabindex=-1 aria-disabled=true' : ''); ?>>
                        Image Attachment
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link <?php echo e(!$workEnabled ? 'disabled' : ''); ?>" 
                        data-bs-toggle="tab" data-bs-target="#work" 
                        <?php echo e(!$workEnabled ? 'disabled tabindex=-1 aria-disabled=true' : ''); ?>>
                        Work Status
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link <?php echo e(!$paymentEnabled ? 'disabled' : ''); ?>" 
                        data-bs-toggle="tab" data-bs-target="#payment" 
                        <?php echo e(!$paymentEnabled ? 'disabled tabindex=-1 aria-disabled=true' : ''); ?>>
                        Payment
                    </button>
                </li>
            </ul>
            <div class="tab-content">

                <!-- SERVICES TAB -->
                <div class="tab-pane fade show active" id="services">
                    <div class="card">
                        
                        <form method="POST" action="<?php echo e(route('bookings.update',$booking->id)); ?>">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('PUT'); ?>

                            <div class="row p-3">
                                <div class="">
                                     <?php echo e($booking->serviceCategory->name ?? ''); ?> -> <?php echo e($booking->service->name ?? ''); ?>

                                </div>
                            </div>

                            <div class="container">
                                <!-- Inputs -->
                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <select name="service_sub_category_id" id="service_sub_category_id" class="form-select select-dropdown" onchange="getServiceIssueList()">
                                            <option value="">Select Sub Service Category</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4">
                                        <select name="service_issue_id" id="service_issue_id" class="form-select select-dropdown">
                                            <option value="">Select Service Issue</option>
                                        </select>
                                    </div>

                                    <div class="col-md-2">
                                        <input type="number" id="qty" class="form-control" placeholder="Qty">
                                    </div>

                                    <div class="col-md-2">
                                        <button type="button" class="btn btn-sm btn-primary me-3" onclick="addRow()">Add</button>
                                        <a href="<?php echo e(route('bookings.estimate.share',$booking->id)); ?>" title="share">
                                            <i class="fa-solid fa-share-nodes"></i>
                                        </a>
                                    </div>
                                    
                                </div>

                                <!-- Table -->
                                <table class="table table-bordered" id="dataTable">
                                    <thead>
                                        <tr>
                                            <th>Sub Service</th>
                                            <th>Issue</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>GST</th>
                                            <th>Discount</th>
                                            <th>Total</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>

                                <!-- Hidden JSON -->
                                <input type="hidden" name="details" id="details">

                                <button type="submit" class="btn btn-success mb-2">Save</button>
                            </div>
                        </form>
                        
                    </div>
                </div>

                <!-- FOLLOWUP TAB -->
                <div class="tab-pane fade" id="followup">
                    <div class="card">
                        <div class="card-body">

                            <!-- FORM -->
                            <form method="POST" action="<?php echo e(route('bookings.followup.store', $booking->id)); ?>">
                                <?php echo csrf_field(); ?>

                                <!-- Row 1: Date, Slot, Priority, Status -->
                                <div class="row g-2 mb-2">
                                    <div class="col-md-3">
                                        <label class="form-label small fw-semibold text-dark mb-1">Schedule Date slot <span class="text-danger">*</span></label>
                                        <input type="date" name="schedule_date" class="form-control" value="<?php echo e(old('schedule_date', date('Y-m-d'))); ?>" required>
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label small fw-semibold text-dark mb-1">Schedule Time slot <span class="text-danger">*</span></label>
                                        <select name="slot_id" class="form-select" required>
                                            <option value="">Select Time Slot</option>
                                            <?php $__currentLoopData = $slots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $slot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <option value="<?php echo e($slot->id); ?>" <?php if(old('slot_id', $booking->slot_id) == $slot->id): echo 'selected'; endif; ?>>
                                                    <?php echo e($slot->slot_time); ?>

                                                </option>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </select>
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label small fw-semibold text-dark mb-1">Priority Level <span class="text-danger">*</span></label>
                                        <select name="priority" class="form-select" required>
                                            <option value="">Select Priority</option>
                                            <option value="high" <?php if(old('priority', 'high') == 'high'): echo 'selected'; endif; ?>>High</option>
                                            <option value="medium" <?php if(old('priority') == 'medium'): echo 'selected'; endif; ?>>Medium</option>
                                            <option value="low" <?php if(old('priority') == 'low'): echo 'selected'; endif; ?>>Low</option>
                                            <option value="urgent" <?php if(old('priority') == 'urgent'): echo 'selected'; endif; ?>>Urgent</option>
                                        </select>
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label small fw-semibold text-dark mb-1">Customer Follow-up Status <span class="text-danger">*</span></label>
                                        <select name="status" class="form-select" required>
                                            <option value="">Select Status</option>
                                            <?php $__currentLoopData = $followupStatuses; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $f): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <option value="<?php echo e($f->name); ?>" <?php if(old('status') == $f->name): echo 'selected'; endif; ?>><?php echo e($f->name); ?></option>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </select>
                                    </div>
                                </div>

                                <!-- Row 2: Tracking Status & Tracking Description (Read Only) -->
                                <div class="row g-2 mb-2">
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold text-dark mb-1">Tracking Status (Read Only)</label>
                                        <input type="text" class="form-control bg-light" readonly
                                            value="<?php echo e($booking->bookingTrackOrders->sortByDesc('created_at')->first()?->status ?? $booking->work_status ?? 'N/A'); ?>">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold text-dark mb-1">Tracking Description (Read Only)</label>
                                        <input type="text" class="form-control bg-light" readonly
                                            value="<?php echo e($booking->bookingTrackOrders->sortByDesc('created_at')->first()?->notes ?? $booking->customer_notes ?? 'N/A'); ?>">
                                    </div>
                                </div>

                                <!-- Row 3: Followup Remark -->
                                <div class="mb-2">
                                    <label class="form-label small fw-semibold text-dark mb-1">Followup Remark:</label>
                                    <textarea name="remarks" class="form-control" rows="3" placeholder="Enter followup remark..."><?php echo e(old('remarks')); ?></textarea>
                                </div>

                                <!-- Row 4: Checkboxes -->
                                <div class="row g-3 mb-3">
                                    <div class="col-md-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="send_sms" id="send_sms" value="1">
                                            <label class="form-check-label" for="send_sms">
                                                Send SMS
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="send_whatsapp" id="send_whatsapp" value="1">
                                            <label class="form-check-label" for="send_whatsapp">
                                                Send WhatsApp
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" class="btn btn-warning text-white btn-sm px-4" style="background-color: #f05a22; border-color: #f05a22;">Save</button>
                            </form>

                            <hr>

                            <!-- LOG TABLE -->
                            <h6 class="fw-bold text-dark mb-2">Logs:</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead class="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Schedule Date & Time</th>
                                            <th>Priority</th>
                                            <th>Followup Status</th>
                                            <th>Remark</th>
                                            <th>SMS Status</th>
                                            <th>Updated By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php $__empty_1 = true; $__currentLoopData = $booking->followups; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $f): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <td><?php echo e($key + 1); ?></td>

                                            <!-- Schedule Date & Time -->
                                            <td>
                                                <?php echo e($f->next_followup_date ? \Carbon\Carbon::parse($f->next_followup_date)->format('d/m/Y H:i') : formatDateTodmYHi($f->created_at)); ?>

                                            </td>

                                            <!-- Priority -->
                                            <td>
                                                <?php echo e(ucfirst($f->priority)); ?>

                                            </td>

                                            <!-- Followup Status -->
                                            <td>
                                                <?php echo e($f->status); ?>

                                            </td>

                                            <!-- Remark -->
                                            <td style="min-width: 200px;">
                                                <?php echo e($f->remarks); ?>

                                            </td>

                                            <!-- SMS Status -->
                                            <td>
                                                <?php if($f->send_whatsapp && $f->send_sms): ?>
                                                    Sent WA & SMS
                                                <?php elseif($f->send_whatsapp): ?>
                                                    Sent WhatsApp
                                                <?php elseif($f->send_sms): ?>
                                                    Sent SMS
                                                <?php else: ?>
                                                    -
                                                <?php endif; ?>
                                            </td>

                                            <!-- Updated By -->
                                            <td>
                                                <b>By: </b><?php echo e($f->user->name ?? 'N/A'); ?> <br>
                                                <b>at: </b><?php echo e(humanDateTime($f->created_at ?? $f->updated_at)); ?>

                                            </td>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="7" class="text-center text-muted py-3">
                                                No followups found
                                            </td>
                                        </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PROVIDER TAB -->
                <div class="tab-pane fade" id="provider">
                    <form action="<?php echo e(route('bookings.vendor.assign')); ?>" method="POST">
                        <?php echo csrf_field(); ?>
                        <input type="hidden" name="booking_id" value="<?php echo e($booking->id); ?>">
                        <input type="hidden" name="name" id="vendor_name" value="">
                        <div class="card">
                            <div class="card-body">
                                <div class="row g-2 mb-2">
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold text-dark mb-1">Select Provider <span class="text-danger">*</span></label>
                                        <select name="vendor_id" id="vendor_id" class="form-select select-dropdown" onchange="vendorSelected()" required>
                                            <option value="">Select Provider</option>
                                            <?php $__currentLoopData = $vendors; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $vendor): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <option value="<?php echo e($vendor->id); ?>"
                                                data-name="<?php echo e($vendor->first_name); ?> <?php echo e($vendor->last_name); ?>"
                                                data-mobile="<?php echo e($vendor->mobile); ?>">
                                                <?php echo e($vendor->first_name); ?> <?php echo e($vendor->last_name); ?>

                                            </option>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold text-dark mb-1">Provider Mobile <span class="text-danger">*</span></label>
                                        <input type="text" name="mobile" id="vendor_mobile" class="form-control" placeholder="Provider Mobile" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label small fw-semibold text-dark mb-1">Select Helper</label>
                                        <select name="helper_id" id="helper_id" class="form-select select-dropdown">
                                            <option value="">Select Helper</option>
                                            <?php $__currentLoopData = $vendors; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $vendor): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <option value="<?php echo e($vendor->id); ?>"
                                                data-name="<?php echo e($vendor->first_name); ?> <?php echo e($vendor->last_name); ?>"
                                                data-mobile="<?php echo e($vendor->mobile); ?>">
                                                <?php echo e($vendor->first_name); ?> <?php echo e($vendor->last_name); ?> (<?php echo e($vendor->mobile); ?>)
                                            </option>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small fw-semibold text-dark mb-1">Remark</label>
                                    <textarea name="remark" class="form-control" rows="3" placeholder="Enter remark..."></textarea>
                                </div>
                                <div class="row g-3 mb-3">
                                    <div class="col-md-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="send_sms" id="provider_send_sms" value="1">
                                            <label class="form-check-label" for="provider_send_sms">
                                                Send SMS
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="send_whatsapp" id="provider_send_whatsapp" value="1">
                                            <label class="form-check-label" for="provider_send_whatsapp">
                                                Send WhatsApp
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-warning text-white btn-sm px-4" style="background-color: #f05a22; border-color: #f05a22;">Save</button>
                            </div>
                        </div>
                    </form>

                    <hr>
                    <!-- LOG TABLE -->
                    <h6 class="fw-bold text-dark mb-2">Logs:</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead class="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Schedule & Time</th>
                                    <th>Type</th>
                                    <th>Provider Details</th>
                                    <th>Remark</th>
                                    <th>SMS Status</th>
                                    <th>Updated By</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php $__empty_1 = true; $__currentLoopData = $booking->bookingVendorAssigns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $f): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <tr>
                                    <td><?php echo e($key + 1); ?></td>

                                    <!-- Schedule & Time -->
                                    <td>
                                        <?php echo e(formatDateTodmYHi($f->created_at)); ?>

                                    </td>

                                    <!-- Followup Type -->
                                    <td>
                                        <?php if($loop->iteration == 1): ?>
                                        New Assign
                                        <?php else: ?>
                                        Re Assign
                                        <?php endif; ?>
                                    </td>

                                    <!-- provider -->
                                    <td>
                                        <?php echo e($f->name ?? ''); ?> <br>
                                        <?php echo e($f->mobile ?? ''); ?> <br>
                                        <?php echo e($f->helper_name ?? ''); ?> <br>
                                        <?php echo e($f->helper_mobile ?? ''); ?>

                                    </td>

                                    <!-- Remark -->
                                    <td>
                                        <?php echo e($f->remark); ?>

                                    </td>

                                    <!-- SMS -->
                                    <td>
                                        <?php echo e($f->send_whatsapp ? 'WhatsApp' : ''); ?>

                                        <?php echo e(($f->send_whatsapp && $f->send_sms) ? ' & ' : ''); ?>

                                        <?php echo e($f->send_sms ? 'SMS' : ''); ?>

                                    </td>

                                    <!-- Updated By -->
                                    <td>
                                        <b>By: </b><?php echo e($f->assignedBy->name ?? 'N/A'); ?> <br>
                                        <b>at: </b><?php echo e(humanDateTime($f->updated_at)); ?>

                                    </td>
                                </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-3">
                                        No logs found
                                    </td>
                                </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>

                </div>

                <!-- PAYMENT TAB -->
                <div class="tab-pane fade" id="payment">
                    <div class="card">
                        <div class="card-body">
                            <form id="paymentForm" action="<?php echo e(route('bookings.payment.store')); ?>" method="POST">
                                <?php echo csrf_field(); ?>
                                <input type="hidden" name="booking_id" value="<?php echo e($booking->id); ?>">

                                <div class="row">
                                    <div class="col-md-3">
                                        <select name="type" class="form-select">
                                            <option value="">Select Payment type</option>
                                            <option value="Full">Full</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                    </div>

                                    <!-- Amount -->
                                    <div class="col-md-3">
                                        <input class="form-control" name="amount" id="amount" placeholder="Amount" value="<?php echo e($finalPrice); ?>">
                                    </div>

                                    <!-- Mode -->
                                    <div class="col-md-3">
                                        <select class="form-select" name="mode" id="mode">
                                            <option value="">Select Mode</option>
                                            <?php $__currentLoopData = $paymentMethods; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pm): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <option value="<?php echo e($pm->name); ?>" data-type="<?php echo e($pm->type); ?>"><?php echo e($pm->name); ?></option>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </select>
                                    </div>

                                    <!-- Ref No -->
                                    <div class="col-md-3">
                                        <input class="form-control" name="ref_no" id="ref_no" placeholder="Ref No">
                                    </div>

                                    <!-- Hidden Razorpay Fields -->
                                    <input type="hidden" name="razorpay_payment_id" id="razorpay_payment_id">
                                    <input type="hidden" name="razorpay_order_id" id="razorpay_order_id">
                                    <input type="hidden" name="razorpay_signature" id="razorpay_signature">

                                    <!-- Button -->
                                    <div class="col-md-3">
                                        <button type="button" id="paymwent-btn" class="btn btn-success btn-sm mt-2">
                                            Save
                                        </button>
                                    </div>

                                </div>
                            </form>

                            <!-- Razorpay Script -->
                            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

                            <script>
                                document.getElementById('paymwent-btn').addEventListener('click', function() {

                                    let modeSelect = document.getElementById('mode');
                                    let selectedOption = modeSelect.options[modeSelect.selectedIndex];
                                    let modeType = selectedOption.getAttribute('data-type');
                                    let amount = document.getElementById('amount').value;

                                    if (modeType === 'Online') {

                                        if (!amount || amount <= 0) {
                                            alert('Enter valid amount');
                                            return;
                                        }

                                        // Create Order (AJAX)
                                        fetch("<?php echo e(route('bookings.orderCreate')); ?>", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "X-CSRF-TOKEN": "<?php echo e(csrf_token()); ?>"
                                                },
                                                body: JSON.stringify({
                                                    amount: amount,
                                                    booking_id: <?php echo e($booking->id); ?>

                                                })
                                            })
                                            .then(res => res.json())
                                            .then(order => {

                                                let options = {
                                                    "key": "<?php echo e(config('key.RAZORPAY_KEY')); ?>",
                                                    "amount": order.amount,
                                                    "currency": "INR",
                                                    "name": "<?php echo e(getSetting('website_name') ?? 'TAS Pro'); ?>",
                                                    "description": "Payment for Booking #<?php echo e($booking->booking_no); ?>",
                                                    "order_id": order.id,

                                                    "handler": function(response) {

                                                        // Razorpay response
                                                        document.getElementById('razorpay_payment_id').value = response.razorpay_payment_id;
                                                        document.getElementById('razorpay_order_id').value = response.razorpay_order_id;
                                                        document.getElementById('razorpay_signature').value = response.razorpay_signature;

                                                        // 👉 SET ref_no = payment_id
                                                        document.getElementById('ref_no').value = response.razorpay_payment_id;

                                                        // Auto set status Paid
                                                        document.querySelector('select[name="status"]').value = 'Paid';

                                                        // Submit form
                                                        document.getElementById('paymentForm').submit();
                                                    },

                                                    "prefill": {
                                                        "name": "<?php echo e($booking->customer->first_name ?? ''); ?> <?php echo e($booking->customer->last_name ?? ''); ?>",
                                                        "email": "<?php echo e($booking->customer->email ?? ''); ?>",
                                                        "contact": "<?php echo e($booking->customer->mobile ?? ''); ?>"
                                                    },

                                                    "theme": {
                                                        "color": "#0d6efd"
                                                    }
                                                };

                                                let rzp = new Razorpay(options);

                                                // Handle payment failure
                                                rzp.on('payment.failed', function(response) {
                                                    alert('Payment Failed');
                                                    console.log(response.error);
                                                });

                                                rzp.open();
                                            });

                                    } else {
                                        // Offline submit
                                        document.getElementById('paymentForm').submit();
                                    }
                                });
                            </script>

                            <hr>
                            <!-- LOG TABLE -->
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Type</th>
                                            <th>Mode</th>
                                            <th>Status</th>
                                            <th>Ref No</th>
                                            <th>Created By</th>
                                            <th class="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php $__currentLoopData = $booking->bookingPayments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $p): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <tr>
                                            <td><?php echo e('INV-' . str_pad($p->id, 3, '0', STR_PAD_LEFT)); ?></td>
                                            <td><?php echo e(formatDateTodmYHi($p->created_at)); ?></td>
                                            <td><?php echo e($p->amount); ?></td>
                                            <td><?php echo e($p->type); ?></td>
                                            <td><?php echo e($p->mode); ?></td>
                                            <td><?php echo e($p->status); ?></td>
                                            <td><?php echo e($p->ref_no); ?></td>
                                            <td><?php echo e($p->created_by); ?></td>
                                            <td>
                                                <?php if($p->mode == "Cash"): ?>
                                                <button type="button" class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#editPayment<?php echo e($p->id); ?>">
                                                    <i class="fa-solid fa-pen-to-square"></i>
                                                </button>

                                                <form action="<?php echo e(route('bookings.payment.destroy')); ?>" id="delete-form<?php echo e($p->id); ?>" method="POST" class="d-inline">
                                                    <?php echo csrf_field(); ?>
                                                    <?php echo method_field('DELETE'); ?>
                                                    <input type="hidden" name="id" value="<?php echo e($p->id); ?>">
                                                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="confirmDelete(<?php echo e($p->id); ?>)" title="Delete">
                                                        <i class="fa fa-trash"></i>
                                                    </button>
                                                </form>
                                                <?php endif; ?>

                                                <a class="btn btn-sm btn-outline-info" href="<?php echo e(route('bookings.payment.receipt',$p->id)); ?>">
                                                    <i class="fa-solid fa-download"></i>
                                                </a>

                                                <a href="<?php echo e(route('bookings.payment.share',['payment_id' => $p->id, 'booking_id' => $booking->id])); ?>" title="share" class="btn btn-sm btn-outline-primary">
                                                    <i class="fa-solid fa-share-nodes"></i>
                                                </a>
                                            </td>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <?php $__currentLoopData = $booking->bookingPayments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $payment): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <!-- Modal -->
                <div class="modal fade" id="editPayment<?php echo e($payment->id); ?>" tabindex="-1" aria-labelledby="exampleModalLabel<?php echo e($payment->id); ?>" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form action="<?php echo e(route('bookings.payment.update')); ?>" method="POST">
                                <?php echo csrf_field(); ?>
                                <?php echo method_field('PUT'); ?>

                                <input type="hidden" class="form-control" name="booking_id" value="<?php echo e($payment->booking_id); ?>">
                                <input type="hidden" name="id" value="<?php echo e($payment->id); ?>">

                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="exampleModalLabel<?php echo e($payment->id); ?>">Edit Payment</h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row">

                                        <div class="">
                                            <select name="type" class="form-select">
                                                <option value="">Select Payment type</option>
                                                <option value="Full" <?php if($payment->type == "Full"): echo 'selected'; endif; ?>>Full</option>
                                                <option value="Partial" <?php if($payment->type == "Partial"): echo 'selected'; endif; ?>>Partial</option>
                                            </select>
                                        </div>

                                        <!-- Amount -->
                                        <div class="mt-3">
                                            <input class="form-control" name="amount" id="amount" value="<?php echo e($payment->amount); ?>" placeholder="Amount">
                                        </div>

                                        <!-- Mode -->
                                        <div class="mt-3">
                                            <select class="form-select" name="mode" id="mode">
                                                <option value="">Select Mode</option>
                                                <?php $__currentLoopData = $paymentMethods; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pm): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <option value="<?php echo e($pm->name); ?>" <?php if($payment->mode == $pm->name): echo 'selected'; endif; ?>><?php echo e($pm->name); ?></option>
                                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                            </select>
                                        </div>

                                        <!-- Ref No -->
                                        <div class="mt-3">
                                            <input class="form-control" name="ref_no" id="ref_no" value="<?php echo e($payment->ref_no); ?>" placeholder="Ref No">
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" class="btn btn-primary">Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                <!-- Image Attachement TAB -->
                <div class="tab-pane fade" id="image_attachment">
                    <form action="<?php echo e(route('bookings.image.attachement')); ?>" method="POST" enctype="multipart/form-data">
                        <?php echo csrf_field(); ?>
                        <input type="hidden" name="booking_id" value="<?php echo e($booking->id); ?>">
                        <div class="card">
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <input type="text" name="brand" id="brand" class="form-control" placeholder="Brand Name" required>
                                    </div>
                                    <div class="col-md-4">
                                        <input type="text" name="model" id="model" class="form-control" placeholder="Model No" required>
                                    </div>
                                    <div class="col-md-4">
                                        <input type="text" name="serial_no" id="serial_no" class="form-control" placeholder="Serial No">
                                    </div>
                                    <div class="col-md-4">
                                        <select name="image_type" id="" class="form-select" required>
                                            <option value="">Select Image Type</option>
                                            <option value="before">Before</option>
                                            <option value="after">After</option>
                                        </select>
                                    </div>
                                    <div class="col-md-12">
                                        <div id="imageFieldsContainer">
                                            <div class="row g-2 mb-2 image-field-row">
                                                <div class="col-md-5">
                                                    <input type="text" name="image_name[]" class="form-control" placeholder="Image Name" required>
                                                </div>
                                                <div class="col-md-5">
                                                    <input type="file" class="form-control" name="images[]" accept="image/*" required>
                                                </div>
                                                <div class="col-md-2">
                                                    <button type="button" class="btn btn-success mt-1" onclick="addImageField()"><i class="fa fa-plus"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary btn-sm mt-3">Save</button>
                            </div>
                        </div>
                    </form>

                    <hr>
                    <!-- LOG TABLE -->
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead class="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Brand</th>
                                    <th>Model</th>
                                    <th>Serial No</th>
                                    <th>Type</th>
                                    <th>Created By</th>
                                    <th>Image</th>
                                    <th>Action</th>
                                </tr>
                            <tbody>
                                <?php $__empty_1 = true; $__currentLoopData = $booking->imageAttachements; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $f): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                <tr>
                                    <td>
                                        <?php echo e(formatDateTodmY($f->created_at)); ?>

                                    </td>
                                    <td><?php echo e($f->brand ?? ''); ?></td>
                                    <td><?php echo e($f->model ?? ''); ?></td>
                                    <td><?php echo e($f->serial_no ?? ''); ?></td>
                                    <td><?php echo e($f->image_type); ?></td>
                                    <td><?php echo e($f->created_by); ?></td>
                                    <td>
                                        <?php
                                            $images = json_decode($f->images, true) ?? [];
                                        ?>
                                        <?php if(is_array($images)): ?>
                                            <?php $__currentLoopData = $images; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $img): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <div class="mb-1 d-flex align-items-center">
                                                    <span class="me-2 fw-bold"><?php echo e($img['name'] ?? 'Image'); ?>:</span>
                                                    <a href="<?php echo e(asset('storage/bookings/' . ($img['file'] ?? ''))); ?>" target="_blank">
                                                        <img src="<?php echo e(asset('storage/bookings/' . ($img['file'] ?? ''))); ?>" alt="<?php echo e($img['name'] ?? 'Image'); ?>" loading="lazy" class="img-fluid rounded border" width="50" height="50" style="object-fit: cover;">
                                                    </a>
                                                </div>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <form action="<?php echo e(route('bookings.image.attachement.destroy',$f->id)); ?>" id="delete-form<?php echo e($f->id); ?>" method="POST" class="d-inline">
                                            <?php echo csrf_field(); ?>
                                            <?php echo method_field('DELETE'); ?>
                                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="confirmDelete(<?php echo e($f->id); ?>)" title="Delete">
                                                <i class="fa fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                <tr>
                                    <td colspan="9" class="text-center text-muted py-3">
                                        No followups found
                                    </td>
                                </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>

                </div>

                <!-- spares TAB -->
                <div class="tab-pane fade" id="spares">
                    <form action="<?php echo e(route('bookings.spare.store')); ?>" method="POST">
                        <?php echo csrf_field(); ?>

                        <input type="hidden" name="booking_id" value="<?php echo e($booking->id); ?>">
                        <input type="hidden" name="vendor_id" value="<?php echo e($booking->vendor_id); ?>">
                        <input type="hidden" name="service_id" value="<?php echo e($booking->service_id); ?>">
                        <input type="hidden" name="spares_json" id="spares_json">

                        <div class="card">
                            <div class="card-body">

                                <div class="row p-2">
                                    <div class="">
                                        <?php echo e($booking->serviceCategory->name ?? ''); ?> -> <?php echo e($booking->service->name ?? ''); ?>

                                    </div>
                                </div>

                                <div class="row g-2 mb-3">
                                    <div class="col-md-4">
                                        <select id="spare_part_id" class="form-select">
                                            <option value="">Select Spare Part</option>

                                            <?php $__currentLoopData = $spareParts; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $part): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <option
                                                    value="<?php echo e($part['id']); ?>"
                                                    data-unit-price="<?php echo e($part['unit_labor_price']); ?>"
                                                    data-customer-price="<?php echo e($part['customer_price']); ?>"
                                                    data-gst="<?php echo e($part['gst_amount']); ?>"
                                                    data-discount="<?php echo e($part['discount_amount']); ?>"
                                                >
                                                    <?php echo e($part['name']); ?>

                                                    (<?php echo e($part['hsn_code']); ?>)
                                                </option>
                                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                        </select>
                                    </div>

                                    <div class="col-md-2">
                                        <input type="number" id="sale_price" class="form-control"
                                            placeholder="Sale Price">
                                    </div>

                                    <div class="col-md-2">
                                        <input type="number" id="purchase_price" class="form-control"
                                            placeholder="Purchase Price">
                                    </div>

                                    <div class="col-md-2">
                                        <input type="number" id="spare_qty" class="form-control"
                                            placeholder="Qty">
                                    </div>

                                    <div class="col-md-2">
                                        <button type="button" class="btn btn-sm btn-primary"
                                            onclick="addSpareRow()">
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <table class="table table-bordered" id="sparesTable">
                                    <thead>
                                        <tr>
                                            <th>Spare Part</th>
                                            <th>Unit Price</th>
                                            <th>Purchase Price</th>
                                            <th>Qty</th>
                                            <th>GST</th>
                                            <th>Discount</th>
                                            <th>Total</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>

                                <button type="submit" class="btn btn-success">
                                    Save
                                </button>

                            </div>
                        </div>
                    </form>

                    
                </div>

                <!-- WORK STATUS -->
                <div class="tab-pane fade" id="work">
                    <div class="card">
                        <div class="card-body">
                            <form action="<?php echo e(route('bookings.work.update')); ?>" method="POST">
                                <?php echo csrf_field(); ?>
                                <input type="hidden" class="form-control" name="booking_id" value="<?php echo e($booking->id); ?>">

                                <div class="row g-2 mb-2">
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold text-dark mb-1">Work Status <span class="text-danger">*</span></label>
                                        <select class="form-select" name="work_status" id="work_status_select" required onchange="updateRemarkReasonOptions(this.value)">
                                            <option value="">Select Work Status</option>
                                            <option value="in_progress" <?php if(old('work_status') == 'in_progress'): echo 'selected'; endif; ?>>In Progress</option>
                                            <option value="completed" <?php if(old('work_status') == 'completed'): echo 'selected'; endif; ?>>Completed</option>
                                            <option value="visit only" <?php if(old('work_status') == 'visit only'): echo 'selected'; endif; ?>>Visit Only</option>
                                            <option value="cancelled" <?php if(old('work_status') == 'cancelled'): echo 'selected'; endif; ?>>Cancelled</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small fw-semibold text-dark mb-1">Work Remark Reason <span class="text-danger">*</span></label>
                                        <select class="form-select" name="work_remark_reason_id" id="work_remark_reason_id" required>
                                            <option value="">-- Select Work Status First --</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small fw-semibold text-dark mb-1">Notes</label>
                                    <textarea class="form-control editor mb-2" name="work_notes" placeholder="Notes"><?php echo e(old('work_notes')); ?></textarea>
                                </div>
                                <div class="row g-3 mb-3">
                                    <div class="col-md-6">
                                        <input type="checkbox" name="send_sms" id=""> Send SMS
                                    </div>
                                    <div class="col-md-6">
                                        <input type="checkbox" name="send_whatsapp" id=""> Send WhatsApp
                                    </div>
                                </div>

                                <button class="btn btn-primary btn-sm">Save</button>
                            </form>

                            <hr>
                            <!-- LOG TABLE -->
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead class="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Schedule & Time</th>
                                            <th>Status</th>
                                            <th>Remark Reason</th>
                                            <th>Notes</th>
                                            <th>SMS Status</th>
                                            <th>Updated By</th>
                                        </tr>
                                    <tbody>
                                        <?php $__empty_1 = true; $__currentLoopData = $booking->bookingWorks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $f): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                        <tr>
                                            <td><?php echo e($key + 1); ?></td>

                                            <!-- Schedule & Time -->
                                            <td>
                                                <?php echo e(formatDateTodmYHi($f->created_at)); ?>

                                            </td>

                                            <!-- Followup Type -->
                                            <td>
                                                <?php echo e(ucfirst($f->work_status)); ?>

                                            </td>

                                            <!-- Status -->
                                            <td>
                                                <?php echo e($f->workRemarkReason->name ?? ''); ?>

                                            </td>

                                            <!-- Remark -->
                                            <td style="min-width: 200px;">
                                                <?php echo e($f->work_notes); ?>

                                            </td>

                                            <!-- SMS -->
                                            <td>
                                                <?php echo e($f->send_whatsapp ? 'WhatsApp' : ''); ?>

                                                <?php echo e(($f->send_whatsapp && $f->send_sms) ? ' & ' : ''); ?>

                                                <?php echo e($f->send_sms ? 'SMS' : ''); ?>

                                            </td>

                                            <!-- Updated By -->
                                            <td>
                                                <b>By: </b><?php echo e($f->user->name ?? 'N/A'); ?> <br>
                                                <b>at: </b><?php echo e(humanDateTime($f->updated_at)); ?>

                                            </td>
                                        </tr>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                        <tr>
                                            <td colspan="9" class="text-center text-muted py-3">
                                                No followups found
                                            </td>
                                        </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RIGHT -->
        <div class="col-lg-3">

            <!-- PRICE -->
            <div class="card mb-1">
                <div class="card-body">
                    <h6 class="fw-bold">Price Details</h6>

                    <?php if($isVisitOnly): ?>
                    <div class="d-flex justify-content-between">
                        <span>Visit Charge</span>
                        <span><?php echo e(number_format($visitCharge, 2)); ?></span>
                    </div>
                    <?php if($booking->bookingSpares->count() > 0): ?>
                    <div class="d-flex justify-content-between">
                        <span>Spare Parts</span>
                        <span><?php echo e(number_format($spareTotal, 2)); ?></span>
                    </div>
                    <?php endif; ?>
                    <?php else: ?>
                    <div class="d-flex justify-content-between">
                        <span>Total</span>
                        <span><?php echo e(number_format($booking->sub_total + $booking->bookingSpares->sum(fn ($spare) => $spare->unit_price * $spare->qty), 2)); ?></span>
                    </div>

                    <div class="d-flex justify-content-between text-danger">
                        <span>Discount</span>
                        <span>-<?php echo e(number_format($booking->discount_amount + $booking->bookingSpares->sum('discount_amount'), 2)); ?></span>
                    </div>

                    <div class="d-flex justify-content-between">
                        <span>GST</span>
                        <span><?php echo e(number_format($booking->gst_amount + $booking->bookingSpares->sum('gst_amount'), 2)); ?></span>
                    </div>
                    <?php endif; ?>

                    <?php if($specialDiscount > 0): ?>
                    <div class="d-flex justify-content-between text-danger">
                        <span>Special Discount</span>
                        <span>-<?php echo e(number_format($specialDiscount, 2)); ?></span>
                    </div>
                    <?php endif; ?>

                    <hr>

                    <div class="fw-bold text-success d-flex justify-content-between">
                        <span>Final</span>
                        <span><?php echo e(number_format($finalPrice, 2)); ?></span>
                    </div>
                </div>
            </div>

            <div class="card mb-1">
                <div class="card-body">
                    <form action="<?php echo e(route('bookings.special.discount.apply')); ?>" method="POST">
                        <?php echo csrf_field(); ?>

                        <input type="hidden" class="form-control" name="booking_id" value="<?php echo e($booking->id); ?>">
                        <input type="hidden" class="form-control" name="grand_total_price" value="<?php echo e($booking->grand_total_price + $booking->bookingSpares->sum('price')); ?>">
                        <div class="row">

                            <div class="col-md-7">Special Discount</div>
                            <div class="col-md-5">
                                <input type="number" name="special_discount_amt" class="form-control" max="<?php echo e($booking->grand_total_price); ?>" value="<?php echo e($booking->special_discount_amt == 0 ? '' : $booking->special_discount_amt); ?>">
                            </div>
                        </div>
                        <?php if($booking->special_discount_amt == 0): ?>
                        <button class="btn btn-primary btn-sm" type="submit">Apply</button>
                        <?php endif; ?>
                    </form>
                </div>
            </div>

            <!-- Invoice -->
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>Paid By</div>
                        <div><?php echo e(optional($booking->bookingPayments()->latest()->first())->mode ?? ''); ?></div>
                    </div>

                    <div class="text-center mt-3">
                        <a href="<?php echo e(route('bookings.invoice', ['id' => $booking->id])); ?>" class="btn btn-outline-secondary w-100">
                            <i class="fa-solid fa-download"></i>
                            Download Invoice
                        </a>
                    </div>

                </div>
            </div>

             <!-- Warranty -->
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="fw-bold">Warranty Details</h6>

                    <?php if(in_array(
                            strtolower($booking->work_status ?? ''),
                            ['completed', 'rework'],
                            true
                        )): ?>
                        <div class="border border-4 p-2">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6>Work Done</h6>
                                    on <?php echo e(date('d-M-Y \a\t h:i A', strtotime($booking->completed_at))); ?><br>
                                    By <?php echo e($booking->vendor?->name); ?>


                                    <div style="color: rgb(237, 95, 39)">
                                        <?php
                                            $warrantyDays = $booking->bookingDetails?->first()?->serviceIssue?->warranty_days ?? 0;

                                            $expiryDate = \Carbon\Carbon::parse($booking->completed_at)
                                                ->addDays($warrantyDays);

                                            if (now()->lt($expiryDate)) {
                                                $diff = now()->diff($expiryDate);

                                                $remainingTime = sprintf(
                                                    '%d Days %02d Hr %02d Minute',
                                                    $diff->days,
                                                    $diff->h,
                                                    $diff->i
                                                );
                                            } else {
                                                $remainingTime = 'Expired';
                                            }
                                        ?>


                                        Warranty Status: 
                                        <?php echo e($remainingTime); ?>

                                        reamaining 
                                    </div>
                                </div>
                                <div>
                                    <!-- Button -->
                                    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#reworkModal">
                                        Create Rework
                                    </button>

                                    <!-- Modal -->
                                    <div class="modal fade" id="reworkModal" tabindex="-1">
                                        <div class="modal-dialog">
                                            <div class="modal-content">

                                                <!-- Header -->
                                                <div class="modal-header">
                                                    <h5 class="modal-title">Create Rework</h5>

                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                </div>

                                                <!-- Form -->
                                                <form action="<?php echo e(route('bookings.rework.store')); ?>" method="POST">
                                                    <?php echo csrf_field(); ?>

                                                    <div class="modal-body">

                                                        <!-- Booking ID -->
                                                        <input type="hidden" name="booking_id" value="<?php echo e($booking->id); ?>">

                                                        <!-- Type -->
                                                        <div class="mb-3">
                                                            <label class="form-label">Type</label>

                                                            <select name="type" class="form-select" required>
                                                                <option value="">Select</option>
                                                                <option value="revisit">Revisit</option>
                                                                <option value="compaint">Complaint</option>
                                                            </select>
                                                        </div>

                                                        <!-- Reason -->
                                                        <div class="mb-3">
                                                            <label class="form-label">Reason</label>

                                                            <textarea name="reason"
                                                                    class="form-control editor"
                                                                    rows="3"
                                                                    required></textarea>
                                                        </div>

                                                    </div>

                                                    <!-- Footer -->
                                                    <div class="modal-footer">
                                                        <button type="button"
                                                                class="btn btn-secondary"
                                                                data-bs-dismiss="modal">
                                                            Close
                                                        </button>

                                                        <button type="submit" class="btn btn-primary">
                                                            Submit
                                                        </button>
                                                    </div>

                                                </form>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3 fw-bold">Logs:</div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead class="table-secondary">
                                    <tr>
                                        <th>Rework Id</th>
                                        <th>Date</th>
                                        <th>Issue Type</th>
                                        <th>Created By</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php $__currentLoopData = $booking->bookingRework; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $work): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <tr>
                                        <td><?php echo e($work->id ? 'R-ENQ-' . $work->id : ''); ?></td>
                                        <td><?php echo e($work->created_at ? date('d/m/Y', strtotime($work->created_at)) : ''); ?></td>
                                        <td><?php echo e($work->type ?? ''); ?></td>
                                        <td><?php echo e($work->created_by ?? ''); ?></td>
                                        <td>active</td>
                                    <td class="text-center">
                                            <div class="d-flex justify-content-center gap-1 flex-nowrap">
                                                <button class="btn btn-sm btn-light">
                                                    <i class="fa fa-edit"></i>
                                                </button>

                                                <form action="<?php echo e(route('bookings.rework.destroy',$work->id)); ?>" method="POST" id="delete-form<?php echo e($work->id); ?>">
                                                    <?php echo csrf_field(); ?>
                                                    <?php echo method_field('DELETE'); ?>
                                                    <button type="button" class="btn btn-sm btn-light"
                                                        title="Delete"
                                                        onclick="return confirmDelete(<?php echo e($work->id); ?>)">
                                                        <i class="fa fa-trash"></i>
                                                    </button>
                                                </form>

                                                <a href="<?php echo e(route('bookings.show',$work->newBooking->booking_no ?? '')); ?>" class="btn btn-sm btn-light">
                                                    <i class="fa fa-eye"></i>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        N/A
                    <?php endif; ?>
                </div>
            </div>

            <!-- GST -->
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="fw-bold">GST Details</h6>

                    <form action="<?php echo e(route('bookings.update', $booking->id)); ?>" method="POST">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PUT'); ?>

                        <div class="row align-items-center">
                            <!-- Inputs -->
                            <div class="col-md-10">
                                <div class="mb-2">
                                    <input type="text"
                                        name="gst_name"
                                        class="form-control"
                                        placeholder="GST Name"
                                        value="<?php echo e($booking->gst_name); ?>">
                                </div>

                                <div>
                                    <input type="text"
                                        name="gst_no"
                                        class="form-control"
                                        placeholder="GST No"
                                        value="<?php echo e($booking->gst_no); ?>">
                                </div>
                            </div>

                            <!-- Edit Button -->
                            <div class="col-md-2 text-end">
                                <button type="submit" class="btn btn-sm btn-outline-primary border-0">
                                    <i class="fa fa-pen"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- PAN -->
            

            <!-- FEEDBACK -->
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h6 class="fw-bold">Feedback</h6>
                        </div>
                        <div>
                            <?php if($booking->status == "Completed" || $booking->status == "Rework"): ?>
                            <a href="#" class="me-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#feedbackModal">
                                <i class="fa fa-plus"></i>
                            </a>

                            
                            <?php endif; ?>
                        </div>
                    </div>
        
                    <?php
                    $rating = $booking->rating ?? 0;
                    ?>

                    <?php for($i = 1; $i <= 5; $i++): ?>
                        <?php if($i <=$rating): ?>
                        ⭐
                        <?php else: ?>
                        ☆
                        <?php endif; ?>
                    <?php endfor; ?>
                        <?php if($booking->review): ?>
                            <p class="small"><?php echo e($booking->review); ?></p>

                            <?php if($booking->feedback_by || $booking->feedback_at): ?>
                                <p>
                                    <?php echo e($booking->feedback_by ? 'by '.$booking->feedback_by : ''); ?>

                                    <?php echo e($booking->feedback_at ? ' at '.date('d/m/Y H:i:s', strtotime($booking->feedback_at)) : ''); ?>

                                </p>
                            <?php endif; ?>
                        <?php endif; ?>
                </div>

                
                <div class="modal fade" id="feedbackModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form action="<?php echo e(route('bookings.feedback.store', $booking->id)); ?>" method="POST">
                                <?php echo csrf_field(); ?>

                                <div class="modal-header">
                                    <h5 class="modal-title">Add Feedback</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>

                                <div class="modal-body">

                                    <div class="mb-3">
                                        <label class="form-label">Rating</label>
                                        <select name="rating" class="form-control" required>
                                            <option value="">Select Rating</option>
                                            <option value="1">⭐ 1</option>
                                            <option value="2">⭐ 2</option>
                                            <option value="3">⭐ 3</option>
                                            <option value="4">⭐ 4</option>
                                            <option value="5">⭐ 5</option>
                                        </select>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Review</label>
                                        <textarea name="review"
                                                class="form-control editor"
                                                rows="4"
                                                placeholder="Write your review..."
                                                required></textarea>
                                    </div>

                                </div>

                                <div class="modal-footer">
                                    <button type="button"
                                            class="btn btn-secondary"
                                            data-bs-dismiss="modal">
                                        Close
                                    </button>

                                    <button type="submit" class="btn btn-primary">
                                        Save Feedback
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TRACK ORDER -->
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="fw-bold mb-4">Track Order</h6>

                    <?php
                        $hasServices = ($booking->bookingDetails && $booking->bookingDetails->count() > 0);
                        $hasFollowup = ($booking->followups && $booking->followups->count() > 0);
                        $hasProvider = (!empty($booking->vendor_id) || ($booking->bookingVendorAssigns && $booking->bookingVendorAssigns->count() > 0));
                        $hasSpares   = ($booking->bookingSpares && $booking->bookingSpares->count() > 0);
                        $hasImages   = ($booking->imageAttachements && $booking->imageAttachements->count() > 0);
                        $hasWork     = ($booking->bookingWorks && $booking->bookingWorks->count() > 0);
                        $hasPayment  = ($booking->bookingPayments && $booking->bookingPayments->count() > 0) || strtolower($booking->payment_status ?? '') === 'paid';

                        $isCancelled = in_array(strtolower($booking->status ?? ''), ['cancelled', 'return cancelled']);

                        $timelineSteps = [];

                        // 1. Services
                        $servicesNotes = $hasServices 
                            ? ($booking->customer_notes ?: 'Your order has been confirmed.')
                            : 'Pending';
                        $servicesTime = $hasServices ? date("D, jS M 'y - h:i A", strtotime($booking->created_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Services',
                            'status' => $hasServices ? 'completed' : 'pending',
                            'notes'  => $servicesNotes,
                            'time'   => $servicesTime,
                        ];

                        // Check if rescheduled
                        $rescheduledTrack = $booking->bookingTrackOrders->firstWhere('status', 'Rescheduled');
                        if ($rescheduledTrack) {
                            $timelineSteps[] = [
                                'title'  => 'Rescheduled',
                                'status' => 'completed',
                                'notes'  => $rescheduledTrack->notes,
                                'time'   => date("D, jS M 'y - h:i A", strtotime($rescheduledTrack->updated_at)),
                            ];
                        }

                        // 2. Follow-up
                        $latestFollowup = $booking->followups->first();
                        $followupNotes = $hasFollowup 
                            ? ($latestFollowup?->remarks ?: ($booking->followup_status ?: 'Follow-up recorded'))
                            : 'Pending';
                        $followupTime = $hasFollowup && $latestFollowup ? date("D, jS M 'y - h:i A", strtotime($latestFollowup->created_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Follow Up',
                            'status' => $hasFollowup ? 'completed' : 'pending',
                            'notes'  => $followupNotes,
                            'time'   => $followupTime,
                        ];

                        // 3. Provider
                        $latestAssign = $booking->bookingVendorAssigns->first();
                        $providerName = $latestAssign?->name ?? ($booking->vendor ? ($booking->vendor->first_name . ' ' . $booking->vendor->last_name) : '');
                        $providerNotes = $hasProvider 
                            ? ('Provider assigned to ' . $providerName)
                            : 'Pending';
                        $providerTime = $hasProvider ? date("D, jS M 'y - h:i A", strtotime($latestAssign?->created_at ?? $booking->updated_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Provider Assigned',
                            'status' => $hasProvider ? 'completed' : 'pending',
                            'notes'  => $providerNotes,
                            'time'   => $providerTime,
                        ];

                        // 4. Spare Parts
                        $sparesNotes = $hasSpares 
                            ? ($booking->bookingSpares->count() . ' spare part(s) added')
                            : 'Pending';
                        $sparesTime = $hasSpares ? date("D, jS M 'y - h:i A", strtotime($booking->bookingSpares->first()?->created_at ?? $booking->updated_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Spare Parts',
                            'status' => $hasSpares ? 'completed' : 'pending',
                            'notes'  => $sparesNotes,
                            'time'   => $sparesTime,
                        ];

                        // 5. Image Attachment
                        $imagesNotes = $hasImages 
                            ? ($booking->imageAttachements->count() . ' image(s) attached')
                            : 'Pending';
                        $imagesTime = $hasImages ? date("D, jS M 'y - h:i A", strtotime($booking->imageAttachements->first()?->created_at ?? $booking->updated_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Image Attachment',
                            'status' => $hasImages ? 'completed' : 'pending',
                            'notes'  => $imagesNotes,
                            'time'   => $imagesTime,
                        ];

                        // 6. Work Status
                        $latestWork = $booking->bookingWorks->first();
                        $workNotes = $hasWork 
                            ? ($latestWork?->work_notes ?: ($booking->work_status ?: 'Work recorded'))
                            : 'Pending';
                        $workTime = $hasWork && $latestWork ? date("D, jS M 'y - h:i A", strtotime($latestWork->created_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Work Status',
                            'status' => $hasWork ? 'completed' : 'pending',
                            'notes'  => $workNotes,
                            'time'   => $workTime,
                        ];

                        // 7. Payment
                        $latestPayment = $booking->bookingPayments->first();
                        $paymentNotes = $hasPayment 
                            ? ($latestPayment ? ('Paid ' . ($latestPayment->amount ?? '') . ' via ' . ($latestPayment->payment_type ?? 'Online')) : 'Paid')
                            : 'Pending';
                        $paymentTime = $hasPayment && $latestPayment ? date("D, jS M 'y - h:i A", strtotime($latestPayment->created_at)) : null;
                        $timelineSteps[] = [
                            'title'  => 'Payment',
                            'status' => $hasPayment ? 'completed' : 'pending',
                            'notes'  => $paymentNotes,
                            'time'   => $paymentTime,
                        ];

                        // Cancelled
                        if ($isCancelled) {
                            $cancelTrack = $booking->bookingTrackOrders->firstWhere('status', 'Cancelled') ?? $booking->bookingTrackOrders->firstWhere('status', 'Return Cancelled');
                            $timelineSteps[] = [
                                'title'  => 'Cancelled',
                                'status' => 'completed',
                                'notes'  => $cancelTrack?->notes ?? 'Order cancelled',
                                'time'   => $cancelTrack ? date("D, jS M 'y - h:i A", strtotime($cancelTrack->updated_at)) : null,
                            ];
                        }
                    ?>

                    <div class="position-relative">
                        <?php $__currentLoopData = $timelineSteps; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $step): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <div class="d-flex position-relative pb-4">
                                <?php if(!$loop->last): ?>
                                    <div class="position-absolute"
                                        style="
                                            left:15px;
                                            top:32px;
                                            width:2px;
                                            height:calc(100% - 8px);
                                            background:<?php echo e($step['status'] == 'completed' ? '#198754' : '#6c757d'); ?>;
                                            z-index:0;">
                                    </div>
                                <?php endif; ?>

                                <div class="flex-shrink-0 position-relative" style="z-index:1;">
                                    <?php if(in_array($step['title'], ['Cancelled', 'Return Cancelled'])): ?>
                                        <div class="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white"
                                            style="width:32px;height:32px;">
                                            <i class="fa fa-xmark"></i>
                                        </div>
                                    <?php elseif($step['status'] == 'completed'): ?>
                                        <div class="rounded-circle bg-success d-flex align-items-center justify-content-center text-white"
                                            style="width:32px;height:32px;">
                                            <i class="fa fa-check"></i>
                                        </div>
                                    <?php else: ?>
                                        <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                            style="width:32px;height:32px;">
                                            <i class="fa fa-clock"></i>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <div class="ms-3 flex-grow-1">
                                    <div class="fw-semibold
                                        <?php if(in_array($step['title'], ['Cancelled', 'Return Cancelled'])): ?>
                                            text-danger
                                        <?php elseif($step['status'] == 'completed'): ?>
                                            text-success
                                        <?php else: ?>
                                            text-secondary
                                        <?php endif; ?>">
                                        <?php echo e($step['title']); ?>

                                    </div>

                                    <?php if(!empty($step['notes'])): ?>
                                        <div class="small text-muted">
                                            <?php echo e($step['notes']); ?>

                                        </div>
                                    <?php endif; ?>

                                    <?php if(!empty($step['time'])): ?>
                                        <div class="small text-secondary">
                                            <?php echo e($step['time']); ?>

                                        </div>
                                    <?php endif; ?>

                                    <?php if($step['status'] == 'pending'): ?>
                                        <div class="small text-secondary">
                                            Pending
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                </div>
            </div>

        </div>

    </div>

    <div class="card">
        <div class="card-body">
            <div class="table-responsive">
                <h5 class="fw-bold">Activity Log</h5>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Activity ID</th>
                            <th>Actor Type</th>
                            <th>Actor Name</th>
                            <th>Module Name</th>
                            <th>Action Type</th>
                            <th>Description</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $__currentLoopData = $booking->bookingActivityLogs ?? []; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $log): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <tr>
                            <td><?php echo e($log->id); ?></td>
                            <td><?php echo e($log->actor_type ?? ''); ?></td>
                            <td><?php echo e($log->actor_name ?? ''); ?></td>
                            <td><?php echo e($log->module_name ?? ''); ?></td>
                            <td><?php echo e($log->action_type ?? ''); ?></td>
                            <td><?php echo e($log->description ?? ''); ?></td>
                            <td><?php echo e(humanDateTime($log->created_at)); ?></td>
                        </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>

<input type="hidden" id="edit_service_category_id" value="<?php echo e($booking->service_category_id); ?>">
<input type="hidden" id="edit_service_id" value="<?php echo e($booking->service_id); ?>">
<input type="hidden" id="edit_city_id" value="<?php echo e($booking->city_id); ?>">

<!-- Reschedule Booking Modal -->
<div class="modal fade" id="rescheduleBookingModal" tabindex="-1" aria-labelledby="rescheduleBookingModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white py-2 px-3">
                <h6 class="modal-title fw-bold" id="rescheduleBookingModalLabel">
                    <i class="fa-solid fa-calendar-days me-2"></i>Reschedule Booking #<?php echo e($booking->booking_no); ?>

                </h6>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="<?php echo e(route('bookings.reschedule', $booking->id)); ?>" method="POST">
                <?php echo csrf_field(); ?>
                <div class="modal-body p-3">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-dark">New Booking Date <span class="text-danger">*</span></label>
                        <input type="date" name="reschedule_date" class="form-control" value="<?php echo e($booking->enquiry_date_time ? date('Y-m-d', strtotime($booking->enquiry_date_time)) : date('Y-m-d')); ?>" min="<?php echo e(date('Y-m-d')); ?>" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-dark">Select Slot <span class="text-danger">*</span></label>
                        <select name="slot_id" class="form-select" required>
                            <option value="">Choose Time Slot</option>
                            <?php $__currentLoopData = $slots; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $slot): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <option value="<?php echo e($slot->id); ?>" <?php if($booking->slot_id == $slot->id): echo 'selected'; endif; ?>>
                                    <?php echo e($slot->slot_time); ?>

                                </option>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small fw-semibold text-dark">Reason / Remarks (Optional)</label>
                        <textarea name="reason" class="form-control" rows="2" placeholder="Reason for rescheduling..."></textarea>
                    </div>
                </div>
                <div class="modal-footer py-2 px-3">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary btn-sm">
                        <i class="fa-solid fa-check me-1"></i>Confirm Reschedule
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Cancel Booking Modal -->
<div class="modal fade" id="cancelBookingModal" tabindex="-1" aria-labelledby="cancelBookingModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-danger text-white py-2 px-3">
                <h6 class="modal-title fw-bold" id="cancelBookingModalLabel">
                    <i class="fa-solid fa-ban me-2"></i>Cancel Booking #<?php echo e($booking->booking_no); ?>

                </h6>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="<?php echo e(route('bookings.cancel', $booking->id)); ?>" method="POST">
                <?php echo csrf_field(); ?>
                <div class="modal-body p-3">
                    <p class="text-muted small mb-3">Are you sure you want to cancel this booking? This will update the status to Cancelled.</p>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-dark">Cancellation Reason <span class="text-danger">*</span></label>
                        <select name="cancel_reason_id" id="cancel_reason_select" class="form-select mb-2" onchange="if(this.value === 'other' || !this.value){ document.getElementById('cancel_reason_text').value = ''; document.getElementById('custom_cancel_reason_box').style.display='block'; } else { document.getElementById('cancel_reason_text').value = this.options[this.selectedIndex].text; document.getElementById('custom_cancel_reason_box').style.display='none'; }">
                            <option value="">Select a reason</option>
                            <?php if(isset($cancelReasons)): ?>
                                <?php $__currentLoopData = $cancelReasons; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cr): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($cr->id); ?>"><?php echo e($cr->name); ?></option>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            <?php endif; ?>
                            <option value="other">Other Reason</option>
                        </select>
                    </div>
                    <div class="mb-2" id="custom_cancel_reason_box">
                        <label class="form-label small fw-semibold text-dark">Reason Details <span class="text-danger">*</span></label>
                        <textarea name="reason" id="cancel_reason_text" class="form-control" rows="2" placeholder="Explain why the booking is being cancelled..." required></textarea>
                    </div>
                </div>
                <div class="modal-footer py-2 px-3">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Back</button>
                    <button type="submit" class="btn btn-danger btn-sm">
                        <i class="fa-solid fa-ban me-1"></i>Cancel Booking
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Address Modal -->
<div class="modal fade" id="editAddressModal" tabindex="-1" aria-labelledby="editAddressModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form action="<?php echo e(route('bookings.address.update', $booking->id)); ?>" method="POST">
                <?php echo csrf_field(); ?>
                <?php echo method_field('PUT'); ?>
                <div class="modal-header">
                    <h5 class="modal-title" id="editAddressModalLabel">Update Address</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="country_list" value="code">
                    <input type="hidden" id="country_id" value="1">
                    <input type="hidden" id="country_id" value="1">
                    <input type="hidden" id="edit_state_id" value="<?php echo e($booking->customerAddress->state_id ?? ''); ?>">
                    <input type="hidden" id="edit_city_id" value="<?php echo e($booking->customerAddress->city_id ?? ''); ?>">
                    <input type="hidden" name="customer_address_id" id="customer_address_id" value="<?php echo e($booking->customerAddress->id ?? ''); ?>">

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">State</label>
                            <select name="state_id" id="state_id" class="form-select" onchange="getCityList()">
                                <option value="">Select State</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">City</label>
                            <select name="city_id" id="city_id" class="form-select" onchange="getAreaList()">
                                <option value="">Select City</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Pincode *</label>
                            <input type="text" name="postal_code" class="form-control" value="<?php echo e($booking->customerAddress->postal_code ?? ''); ?>" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Latitude</label>
                            <input type="text" name="latitude" class="form-control" value="<?php echo e($booking->customerAddress->latitude ?? ''); ?>">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Longitude</label>
                            <input type="text" name="longitude" class="form-control" value="<?php echo e($booking->customerAddress->longitude ?? ''); ?>">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">House Number *</label>
                            <input type="text" name="house_number" id="house_number" class="form-control" value="<?php echo e($booking->customerAddress->house_number ?? ''); ?>" required>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Street *</label>
                            <input type="text" name="street" id="street" class="form-control" value="<?php echo e($booking->customerAddress->street ?? ''); ?>" required>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Address Type *</label>
                            <select name="type" id="type" class="form-select" required>
                                <option value="Home" <?php if($booking->customerAddress->type ?? '' =='Home' ): echo 'selected'; endif; ?>>Home</option>
                                <option value="Work" <?php if($booking->customerAddress->type ?? '' =='Work' ): echo 'selected'; endif; ?>>Work</option>
                                <option value="Other" <?php if($booking->customerAddress->type ?? '' =='Other' ): echo 'selected'; endif; ?>>Other</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<?php if (isset($component)) { $__componentOriginal73f36b44041cfc386eb521d3e76b4de7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal73f36b44041cfc386eb521d3e76b4de7 = $attributes; } ?>
<?php $component = App\View\Components\ConfirmDelete::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('confirm-delete'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\ConfirmDelete::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal73f36b44041cfc386eb521d3e76b4de7)): ?>
<?php $attributes = $__attributesOriginal73f36b44041cfc386eb521d3e76b4de7; ?>
<?php unset($__attributesOriginal73f36b44041cfc386eb521d3e76b4de7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal73f36b44041cfc386eb521d3e76b4de7)): ?>
<?php $component = $__componentOriginal73f36b44041cfc386eb521d3e76b4de7; ?>
<?php unset($__componentOriginal73f36b44041cfc386eb521d3e76b4de7); ?>
<?php endif; ?>
<script>
    function getSubServiceList() {
        var serviceId = $('#edit_service_id').val();
        var cityId = $('#edit_city_id').val();

        $.ajax({
            type: "GET",
            url: "<?php echo e(route('dropdown.service.sub.categories')); ?>",
            data: {
                service_id: serviceId,
                city_id: cityId
            },
            success: function(response) {
                $('#service_sub_category_id').html('');
                $('#service_sub_category_id').html(response);
            }
        });
    }
    getSubServiceList();

    function getServiceIssueList() {
        var serviceSubCategoryId = $('#service_sub_category_id').val();
        var cityId = $('#edit_city_id').val();
        console.log(serviceSubCategoryId, cityId);

        $.ajax({
            type: "GET",
            url: "<?php echo e(route('dropdown.service.issues')); ?>",
            data: {
                service_sub_category_id: serviceSubCategoryId,
                city_id: cityId
            },
            success: function(response) {
                $('#service_issue_id').html('');
                $('#service_issue_id').html(response);
                if (window.pendingEditIssueId) {
                    $('#service_issue_id').val(window.pendingEditIssueId);
                    window.pendingEditIssueId = null;
                }
            }
        });
    }

    let items = [];
    // ➕ Add Row
    function addRow() {

        let subService = document.getElementById("service_sub_category_id");
        let subServiceOption = subService.options[subService.selectedIndex];

        let issueSelect = document.getElementById("service_issue_id");
        let issueOption = issueSelect.options[issueSelect.selectedIndex];

        let qty = parseInt(document.getElementById("qty").value);

        // IDs
        let service_category_id = document.getElementById("edit_service_category_id").value;
        let service_id = document.getElementById("edit_service_id").value;
        let service_sub_category_id = subService.value;
        let service_issue_id = issueSelect.value;

        // Names
        let sub_service_name = subServiceOption.text;
        let issue_name = issueOption.text;

        // Validation
        if (!service_category_id || !service_id || !service_sub_category_id || !service_issue_id) {
            alert("Please select category, service, model & issue");
            return;
        }

        let price = parseFloat(issueOption.dataset.base_price || 0);
        let min_qty = parseInt(issueOption.dataset.min_qty || 1);
        let max_qty = parseInt(issueOption.dataset.max_qty || 100);

        let gst = parseFloat(issueOption.dataset.gst || 0);
        //let sgst = parseFloat(issueOption.dataset.sgst || 0);
       // let igst = parseFloat(issueOption.dataset.igst || 0);

        let final_price = parseFloat(issueOption.dataset.final_price || 0);

        if (!qty || qty < min_qty || qty > max_qty) {
            alert(`Quantity must be between ${min_qty} and ${max_qty}`);
            return;
        }

        // Calculation
        let subtotal = price * qty;

        // GST
        let taxPercent = gst;
        let gst_amount = subtotal * (taxPercent / 100);

        // Amount after GST
        let amountAfterGST = subtotal + gst_amount;

        // // Discount
        // let discountType = issueOption.dataset.discount_type;
        // let discountValue = parseFloat(issueOption.dataset.discount_value || 0);
        // let discount = 0;

        // if (discountType === "Percentage") {
        //     discount = (amountAfterGST * discountValue) / 100;
        // } else {
        //     discount = qty * discountValue; // flat discount
        // }

        // // Final Total
        // let total = amountAfterGST - discount;

        let customerPrice = parseFloat(issueOption.dataset.customer_price || 0);

        let total = customerPrice * qty;

        let discount = amountAfterGST - total;

        // 🚫 Duplicate check
        let exists = items.find(item =>
            item.service_sub_category_id == service_sub_category_id &&
            item.service_issue_id == service_issue_id
        );

        if (exists) {
            showError("This item is already added!");
            return;
        }

        // Store
        items.push({
            service_category_id,
            service_id,
            service_sub_category_id,
            service_issue_id,
            sub_service_name,
            issue_name,
            unit_price: price,
            qty,
            discount,
            // cgst,
            // sgst,
            // igst,
            gst,
            gst_amount,
            total
        });

        renderTable();
        clearInputs();
    }

    // ❌ Remove Row
    function removeRow(index) {
        items.splice(index, 1);
        renderTable();
        // prepareData();
        $('#details').val('');
        $('#details').val(JSON.stringify(items));
    }

    // ✏️ Edit Row
    function editRow(index) {
        let item = items[index];
        
        // 1. Set quantity
        $('#qty').val(item.qty);

        // 2. Set sub-category and trigger ajax
        window.pendingEditIssueId = item.service_issue_id;
        $('#service_sub_category_id').val(item.service_sub_category_id).trigger('change');

        // 3. Remove the item from list so it can be re-added
        removeRow(index);
    }

    // 🔁 Render Table
    function renderTable() {
        let tbody = document.querySelector("#dataTable tbody");
        tbody.innerHTML = "";

        let subTotal = 0;
        let gstTotal = 0;
        let discountTotal = 0;
        let grandTotal = 0;

        items.forEach((item, index) => {
            subTotal += item.unit_price * item.qty;
            gstTotal += item.gst_amount;
            discountTotal += item.discount;
            grandTotal += item.total;

            tbody.innerHTML += `
                    <tr>
                        <td>${item.sub_service_name}</td>
                        <td>${item.issue_name}</td>
                        <td>${item.unit_price}</td>
                        <td>${item.qty}</td>
                        <td>${item.gst_amount}</td>
                        <td>${item.discount}</td>
                        <td>${item.total}</td>
                        <td>
                            <span onclick="editRow(${index})" style="cursor:pointer;color:#0d6efd;font-weight:600;margin-right:10px;"><i class="fa fa-pen"></i></span>
                            <span onclick="removeRow(${index})" style="cursor:pointer;color:red;font-weight:600;">✖</span>
                        </td>
                    </tr>
                `;
        });

        // Update Summary
        $('#summary_sub_total').text(subTotal);
        $('#summary_gst_total').text(gstTotal);
        $('#summary_discount_total').text(discountTotal);
        $('#summary_grand_total').text(grandTotal);

        $('#details').val('');
        $('#details').val(JSON.stringify(items));
    }

    // 🧹 Clear Inputs
    function clearInputs() {
        document.getElementById("qty").value = "";
    }

    let existingItems = <?php echo json_encode($bookingDetails, 15, 512) ?>;

    console.log(existingItems);

    document.addEventListener("DOMContentLoaded", function() {
        if (existingItems.length > 0) {
            items = existingItems; // ✅ assign here
            renderTable();
        }
    });
</script>

<script>
    function vendorSelected() {
        let vendorId = $('#vendor_id').val();
        let selectedOption = $('#vendor_id option:selected');
        let mobile = selectedOption.data('mobile') || '';
        let name = selectedOption.data('name') || '';
        $('#vendor_mobile').val(mobile);
        $('#vendor_name').val(name);

        // Hide / disable the selected provider from the Helper list
        let currentHelperVal = $('#helper_id').val();
        $('#helper_id option').each(function() {
            let helperVal = $(this).val();
            if (helperVal && helperVal == vendorId) {
                $(this).prop('disabled', true).hide();
            } else {
                $(this).prop('disabled', false).show();
            }
        });

        if (currentHelperVal && currentHelperVal == vendorId) {
            $('#helper_id').val('').trigger('change');
        } else if ($('#helper_id').hasClass('select2-hidden-accessible')) {
            $('#helper_id').trigger('change.select2');
        }
    }

    $(document).ready(function() {
        if ($('#vendor_id').val()) {
            vendorSelected();
        }
    });
</script>

<script>
    $(document).ready(function() {

        let params = new URLSearchParams(window.location.search);
        let activeTab = params.get('tab');

        if (activeTab) {
            let $tab = $('#bookingTabs button[data-bs-target="#' + activeTab + '"]');
            if ($tab.length && !$tab.hasClass('disabled') && !$tab.is(':disabled')) {
                $('#bookingTabs .nav-link').removeClass('active');
                $('.tab-pane').removeClass('show active');
                let tab = new bootstrap.Tab($tab[0]);
                tab.show();
            }
        }

        // Keep URL tab in sync when user clicks any tab without reloading
        $('#bookingTabs button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
            let target = $(e.target).attr('data-bs-target');
            if (target) {
                let tabName = target.replace('#', '');
                let newUrl = window.location.pathname + '?tab=' + tabName;
                window.history.replaceState(null, null, newUrl);
            }
        });

        // Instant Client-Side Form Validation (prevents reload on missing required fields)
        $('form').on('submit', function(e) {
            let form = this;
            let isValid = true;
            let firstInvalidField = null;
            let missingName = '';

            $(form).find('input[required], select[required], textarea[required]').each(function() {
                let val = $(this).val();
                let isFieldEmpty = false;

                if (val === null || val === undefined || String(val).trim() === '') {
                    isFieldEmpty = true;
                } else if (
                    val === 'Select Status' ||
                    val === 'Select Followup Type' ||
                    val === 'Select Priority' ||
                    val === 'Select Provider' ||
                    val === 'Select Work Status' ||
                    val === 'Select Work Remark Reason' ||
                    val === 'Select Image Type' ||
                    val === 'Select Mode' ||
                    val === 'Select Payment type'
                ) {
                    isFieldEmpty = true;
                }

                if (isFieldEmpty) {
                    isValid = false;
                    $(this).addClass('is-invalid');
                    if (!firstInvalidField) {
                        firstInvalidField = $(this);
                        missingName = $(this).attr('placeholder') ||
                                      $(this).prev('label').text() ||
                                      $(this).find('option:first').text() ||
                                      $(this).attr('name') || 'required field';
                        missingName = missingName.replace(/Select\s*/i, '').trim();
                    }
                } else {
                    $(this).removeClass('is-invalid');
                }
            });

            if (!isValid) {
                e.preventDefault();
                e.stopPropagation();
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Required Field Missing',
                            text: 'Please fill / select: ' + missingName,
                            confirmButtonColor: '#f97316'
                        });
                    } else {
                        alert('Please fill / select: ' + missingName);
                    }
                }
                return false;
            }
        });

        // Clear error style on input
        $('input, select, textarea').on('input change', function() {
            if ($(this).val()) {
                $(this).removeClass('is-invalid');
            }
        });
    });
</script>
<?php
    $bookingStatusLower = strtolower($booking->status ?? '');
?>
<?php if(in_array($bookingStatusLower, ['cancelled', 'rework', 'completed'])): ?>
<script>
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        // Disable buttons except allowed ones
        document.querySelectorAll('.container-fluid button, .container-fluid .btn, span[onclick]')
            .forEach(btn => {
                if (btn.closest('#paymentForm')) return;
                if (btn.getAttribute('data-bs-target') === '#reworkModal' || btn.closest('#reworkModal')) return;
                if (btn.getAttribute('data-bs-target') === '#feedbackModal' || btn.closest('#feedbackModal')) return;
                if (btn.closest('.nav-tabs') || btn.classList.contains('nav-link')) return;
                if (btn.getAttribute('href') === "<?php echo e(route('bookings.index')); ?>" || 
                    (btn.closest('a') && btn.closest('a').getAttribute('href') === "<?php echo e(route('bookings.index')); ?>")) {
                    return;
                }
                if (btn.innerHTML.includes('fa-download') || btn.innerHTML.includes('fa-share') || btn.getAttribute('title') === 'share') {
                    return;
                }
                btn.disabled = true;
                btn.classList.add('disabled');
                btn.style.pointerEvents = 'none';
                if (btn.tagName === 'SPAN') btn.style.opacity = '0.5';
            });

        // Disable all fields except allowed forms/modals
        document.querySelectorAll('.container-fluid input, .container-fluid select, .container-fluid textarea').forEach(field => {
            if (field.closest('#paymentForm') || field.closest('#reworkModal') || field.closest('#feedbackModal')) {
                field.disabled = false;
                return;
            }
            field.disabled = true;
        });

        // Payment form submit
        const paymentForm = document.getElementById('paymentForm');
        const paymentBtn = document.getElementById('paymwent-btn');
        if (paymentForm && paymentBtn) {
            paymentBtn.disabled = false;
            paymentBtn.classList.remove('disabled');
            paymentBtn.style.pointerEvents = 'auto';
            paymentBtn.addEventListener('click', function (e) {
                e.preventDefault();
                paymentForm.submit();
            });
        }
    }, 100);
});
</script>
<?php endif; ?>

<script>
$('#spare_part_id').on('change', function () {

    let selected = $(this).find(':selected');

    $('#sale_price').val(selected.data('customer-price') || '');
    $('#purchase_price').val('');
});

let existingSpares = <?php echo json_encode($bookingSparesList ?? [], 15, 512) ?>;
let spares = existingSpares.length > 0 ? existingSpares : [];
let editIndex = -1;

$(document).ready(function() {
    if (spares.length > 0) {
        renderSpareTable();
    }
});

function addSpareRow()
{
    let sparePartId = $('#spare_part_id').val();

    if (!sparePartId) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please select spare part'
        });
        return;
    }

    let selected = $('#spare_part_id option:selected');

    let sparePartName = selected.text().trim();

    let purchasePrice = $('#purchase_price').val();
    let qty = $('#spare_qty').val();

    if (!qty) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Quantity is required'
        });
        return;
    }

    let unitPrice = parseFloat(selected.data('unit-price')) || 0;
    let customerPrice = parseFloat($('#sale_price').val()) || parseFloat(selected.data('customer-price')) || 0;
    let gst = (parseFloat(selected.data('gst')) || 0) * qty;
    let discount = (parseFloat(selected.data('discount')) || 0) * qty;

    let exists = spares.some((item, index) => {
        return item.spare_part_id == sparePartId && index !== editIndex;
    });

    if (exists) {
        Swal.fire({
            icon: 'error',
            title: 'Duplicate Spare Part',
            text: 'This spare part is already added.'
        });
        return;
    }

    let rowData = {
        spare_part_id: sparePartId,
        spare_part_name: sparePartName,
        unit_price: unitPrice,
        customer_price: customerPrice,
        purchase_price: purchasePrice,
        qty: qty,
        gst: gst,
        discount: discount
    };

    if (editIndex >= 0) {
        spares[editIndex] = rowData;
        editIndex = -1;
        $('.btn-success').text('Add');
    } else {
        spares.push(rowData);
    }

    renderSpareTable();

    $('#spare_part_id').val('');
    $('#sale_price').val('');
    $('#purchase_price').val('');
    $('#spare_qty').val('');
}

function editSpareRow(index)
{
    let item = spares[index];

    $('#spare_part_id').val(item.spare_part_id).trigger('change');
    $('#sale_price').val(item.customer_price);
    $('#purchase_price').val(item.purchase_price);
    $('#spare_qty').val(item.qty);

    editIndex = index;

    $('.btn-success').text('Update');
}

function removeSpareRow(index)
{
    spares.splice(index, 1);
    renderSpareTable();
}

function renderSpareTable()
{
    let tbody = $('#sparesTable tbody');

    tbody.html('');

    let grandTotal = 0;

    spares.forEach((item, index) => {

        let total = item.customer_price * item.qty;

        grandTotal += total;

        tbody.append(`
            <tr>
                <td>${item.spare_part_name}</td>
                <td>₹${item.unit_price}</td>
                <td>₹${item.purchase_price}</td>
                <td>${item.qty}</td>
                <td>₹${item.gst}</td>
                <td>₹${item.discount}</td>
                <td>₹${total}</td>
                <td>
                    <span
                        onclick="editSpareRow(${index})" 
                        style="cursor:pointer;color:#0d6efd;font-weight:600;margin-right:10px;">
                        <i class="fa fa-pen"></i>
                    </span>

                    <span
                        onclick="removeSpareRow(${index})"
                        style="cursor:pointer;color:red;font-weight:600;">
                        ✖
                    </span>
                </td>
            </tr>
        `);
    });

    if (spares.length > 0) {
        tbody.append(`
            <tr class="table-light fw-bold">
                <td colspan="6" class="text-end">
                    Grand Total
                </td>
                <td>
                    ₹${grandTotal}
                </td>
                <td></td>
            </tr>
        `);
    }

    updateSpareJson();
}

function updateSpareJson()
{
    $('#spares_json').val(JSON.stringify(spares));
}

<?php echo $__env->make('includes.geography-create-ajax', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

function initAddressEdit() {
    getStateList();
    getCityList();
    getAreaList();
}

function addImageField() {
    let html = `
    <div class="row g-2 mb-2 image-field-row">
        <div class="col-md-5">
            <input type="text" name="image_name[]" class="form-control" placeholder="Image Name" required>
        </div>
        <div class="col-md-5">
            <input type="file" class="form-control" name="images[]" accept="image/*" required>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger mt-1" onclick="this.closest('.image-field-row').remove()"><i class="fa fa-trash"></i></button>
        </div>
    </div>`;
    $('#imageFieldsContainer').append(html);
}
</script>

<script>
    const remarkReasonsByStatus = {
        'in_progress': [
            <?php $__currentLoopData = $workRemarkReasons->whereIn('name', ['Work Started', 'Technician Assigned', 'On Site', 'Material Arranged', 'Inspection In Progress', 'Customer Reported Issue', 'Quality Issue Found', 'Revisit Required', 'Incomplete Work', 'Replacement Required']); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $r): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                { id: <?php echo e($r->id); ?>, name: "<?php echo e(addslashes($r->name)); ?>" },
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        ],
        'completed': [
            <?php $__currentLoopData = $workRemarkReasons->whereIn('name', ['Work Completed Successfully', 'Issue Resolved', 'Service Delivered', 'Customer Verified', 'Job Closed']); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $r): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                { id: <?php echo e($r->id); ?>, name: "<?php echo e(addslashes($r->name)); ?>" },
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        ],
        'visit only': [
            <?php $__currentLoopData = $workRemarkReasons->whereIn('name', ['Inspection In Progress', 'On Site', 'Customer Not Available', 'Unable To Contact Customer', 'Material Arranged']); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $r): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                { id: <?php echo e($r->id); ?>, name: "<?php echo e(addslashes($r->name)); ?>" },
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        ],
        'cancelled': [
            <?php $__currentLoopData = $workRemarkReasons->whereIn('name', ['Cancelled By Customer', 'Cancelled By Vendor', 'Customer Not Available', 'Duplicate Booking', 'Unable To Contact Customer']); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $r): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                { id: <?php echo e($r->id); ?>, name: "<?php echo e(addslashes($r->name)); ?>" },
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        ]
    };

    function updateRemarkReasonOptions(selectedStatus, selectedId = null) {
        const selectEl = document.getElementById('work_remark_reason_id');
        if (!selectEl) return;
        
        selectEl.innerHTML = '';

        if (!selectedStatus || !remarkReasonsByStatus[selectedStatus]) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '-- Select Work Status First --';
            selectEl.appendChild(opt);
            return;
        }

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Select Work Remark Reason';
        selectEl.appendChild(defaultOpt);

        const reasons = remarkReasonsByStatus[selectedStatus] || [];
        reasons.forEach(function(r) {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            if (selectedId && Number(selectedId) === Number(r.id)) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        const statusEl = document.getElementById('work_status_select');
        const oldReasonId = "<?php echo e(old('work_remark_reason_id')); ?>";
        if (statusEl && statusEl.value) {
            updateRemarkReasonOptions(statusEl.value, oldReasonId);
        }
    });
</script>

<?php $__env->stopPush(); ?>
<?php echo $__env->make('layouts.panel', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>